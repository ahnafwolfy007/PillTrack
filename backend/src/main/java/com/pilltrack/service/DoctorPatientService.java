package com.pilltrack.service;

import com.pilltrack.dto.request.MedicationModificationRequestDto;
import com.pilltrack.dto.request.ModificationResponseDto;
import com.pilltrack.dto.response.DoctorPatientResponse;
import com.pilltrack.dto.response.MedicationModificationRequestResponse;
import com.pilltrack.dto.response.PatientSummaryResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.*;
import com.pilltrack.model.enums.ModificationRequestStatus;
import com.pilltrack.model.enums.NotificationType;
import com.pilltrack.repository.*;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class DoctorPatientService {

    private final DoctorRepository doctorRepository;
    private final DoctorPatientRepository doctorPatientRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    private final NotificationService notificationService;
    private final MedicationModificationRequestRepository modificationRequestRepository;
    private final MedicationRepository medicationRepository;

    public List<PatientSummaryResponse> getMyPatients() {
        Doctor doctor = getCurrentDoctor();
        return doctorPatientRepository.findByDoctorId(doctor.getId()).stream()
                .map(this::mapToPatientSummary)
                .collect(Collectors.toList());
    }

    public PatientSummaryResponse addPatient(Long patientId) {
        Doctor doctor = getCurrentDoctor();
        Long targetPatientId = Objects.requireNonNull(patientId, "patientId is required");
        User patient = userRepository.findById(targetPatientId)
            .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetPatientId));

        if (doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), targetPatientId)) {
            return mapToPatientSummary(
                doctorPatientRepository.findByDoctorIdAndPatientId(doctor.getId(), targetPatientId)
                    .orElseThrow(() -> new ResourceNotFoundException("DoctorPatient", "patientId", targetPatientId))
            );
        }

        DoctorPatient link = DoctorPatient.builder()
            .doctor(doctor)
            .patient(patient)
            .status("ACTIVE")
            .canModifyMedication(false)
            .build();
        Objects.requireNonNull(link, "Doctor-patient link is required");
        doctorPatientRepository.save(link);

        // Notify patient about the assignment
        notificationService.createNotification(
                patient.getId(),
                NotificationType.DOCTOR_ASSIGNED,
                "Doctor linked",
                String.format("%s has been assigned as your doctor", doctor.getName()),
                "/dashboard/profile"
        );

        log.info("Linked patient {} to doctor {}", targetPatientId, doctor.getId());
        return mapToPatientSummary(link);
    }

    public void removePatient(Long patientId) {
        Doctor doctor = getCurrentDoctor();
        if (!doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            return;
        }
        doctorPatientRepository.deleteByDoctorIdAndPatientId(doctor.getId(), patientId);
        log.info("Removed patient {} from doctor {}", patientId, doctor.getId());
    }

    // ==================== Medication Modification Requests ====================

    public MedicationModificationRequestResponse createModificationRequest(MedicationModificationRequestDto request) {
        Doctor doctor = getCurrentDoctor();

        User patient = userRepository.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient", "id", request.getPatientId()));

        // Verify doctor-patient relationship exists
        if (!doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), patient.getId())) {
            throw new BadRequestException("This patient is not assigned to you");
        }

        Medication medication = null;
        if (request.getMedicationId() != null) {
            medication = medicationRepository.findById(request.getMedicationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", request.getMedicationId()));

            // Verify medication belongs to patient
            if (!medication.getUser().getId().equals(patient.getId())) {
                throw new BadRequestException("This medication does not belong to the patient");
            }
        }

        MedicationModificationRequest modRequest = MedicationModificationRequest.builder()
                .doctor(doctor)
                .patient(patient)
                .medication(medication)
                .requestType(request.getRequestType())
                .message(request.getMessage())
                .proposedChanges(request.getProposedChanges())
                .status(ModificationRequestStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .build();

        modRequest = modificationRequestRepository.save(modRequest);

        // Notify patient
        notificationService.createNotification(
                patient.getId(),
                NotificationType.MEDICATION_CHANGE_REQUEST,
                "Medication Change Request",
                String.format("Dr. %s has requested to modify your medication. Please review.", doctor.getName()),
                "/dashboard/requests"
        );

        log.info("Doctor {} created modification request {} for patient {}", 
                doctor.getId(), modRequest.getId(), patient.getId());

        return mapToModificationRequestResponse(modRequest);
    }

    public MedicationModificationRequestResponse respondToRequest(Long requestId, ModificationResponseDto response) {
        User user = currentUser.getUser();
        
        MedicationModificationRequest modRequest = modificationRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("ModificationRequest", "id", requestId));

        // Extract values for use in lambdas (must be effectively final)
        final Long doctorId = modRequest.getDoctor().getId();
        final Long patientId = user.getId();

        // Verify request belongs to this patient
        if (!modRequest.getPatient().getId().equals(user.getId())) {
            throw new BadRequestException("This request does not belong to you");
        }

        if (modRequest.getStatus() != ModificationRequestStatus.PENDING) {
            throw new BadRequestException("This request has already been processed");
        }

        if (modRequest.getExpiresAt() != null && modRequest.getExpiresAt().isBefore(LocalDateTime.now())) {
            modRequest.setStatus(ModificationRequestStatus.EXPIRED);
            modificationRequestRepository.save(modRequest);
            throw new BadRequestException("This request has expired");
        }

        if (response.isAccept()) {
            modRequest.setStatus(ModificationRequestStatus.ACCEPTED);
            
            // Grant doctor permission to modify this patient's medication
            DoctorPatient doctorPatient = doctorPatientRepository
                    .findByDoctorIdAndPatientId(doctorId, patientId)
                    .orElseThrow(() -> new ResourceNotFoundException("DoctorPatient", "doctor-patient", 
                            doctorId + "-" + patientId));
            
            doctorPatient.setCanModifyMedication(true);
            doctorPatientRepository.save(doctorPatient);

            // Notify doctor
            Doctor doctor = modRequest.getDoctor();
            if (doctor.getUser() != null) {
                notificationService.createNotification(
                        doctor.getUser().getId(),
                        NotificationType.MEDICATION_CHANGE_APPROVED,
                        "Request Accepted",
                        String.format("Patient %s has accepted your medication modification request.", user.getName()),
                        "/doctor/patients"
                );
            }
            
            log.info("Patient {} accepted modification request {} from doctor {}", 
                    user.getId(), requestId, modRequest.getDoctor().getId());
        } else {
            modRequest.setStatus(ModificationRequestStatus.REJECTED);
            
            Doctor doctor = modRequest.getDoctor();
            if (doctor.getUser() != null) {
                notificationService.createNotification(
                        doctor.getUser().getId(),
                        NotificationType.MEDICATION_CHANGE_REJECTED,
                        "Request Rejected",
                        String.format("Patient %s has rejected your medication modification request.", user.getName()),
                        "/doctor/patients"
                );
            }
            
            log.info("Patient {} rejected modification request {} from doctor {}", 
                    user.getId(), requestId, modRequest.getDoctor().getId());
        }

        modRequest.setPatientResponseMessage(response.getResponseMessage());
        modRequest.setRespondedAt(LocalDateTime.now());
        modRequest = modificationRequestRepository.save(modRequest);

        return mapToModificationRequestResponse(modRequest);
    }

    public List<MedicationModificationRequestResponse> getPatientRequests() {
        User user = currentUser.getUser();
        return modificationRequestRepository.findByPatientIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToModificationRequestResponse)
                .collect(Collectors.toList());
    }

    public List<MedicationModificationRequestResponse> getDoctorRequests() {
        Doctor doctor = getCurrentDoctor();
        return modificationRequestRepository.findByDoctorIdOrderByCreatedAtDesc(doctor.getId()).stream()
                .map(this::mapToModificationRequestResponse)
                .collect(Collectors.toList());
    }

    public boolean canDoctorModifyPatientMedication(Long patientId) {
        Doctor doctor = getCurrentDoctor();
        return doctorPatientRepository.findByDoctorIdAndPatientId(doctor.getId(), patientId)
                .map(DoctorPatient::getCanModifyMedication)
                .orElse(false);
    }

    public void verifyPatientLinked(Long patientId) {
        Doctor doctor = getCurrentDoctor();
        if (!doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            throw new AccessDeniedException("This patient is not linked to you");
        }
    }

    public List<DoctorPatientResponse> getPatientDoctors() {
        User user = currentUser.getUser();
        return doctorPatientRepository.findAll().stream()
                .filter(dp -> dp.getPatient().getId().equals(user.getId()))
                .map(this::mapToDoctorPatientResponse)
                .collect(Collectors.toList());
    }

    private Doctor getCurrentDoctor() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        if (!currentUser.isDoctor()) {
            throw new AccessDeniedException("Only doctors can perform this action");
        }

        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", user.getId()));
    }

    private PatientSummaryResponse mapToPatientSummary(DoctorPatient link) {
        User patient = link.getPatient();
        return PatientSummaryResponse.builder()
                .id(patient.getId())
                .name(patient.getName())
                .email(patient.getEmail())
                .phone(patient.getPhone())
                .city(patient.getCity())
                .avatarUrl(patient.getProfileImageUrl())
                .isActive(patient.getIsActive())
                .assignedAt(link.getCreatedAt())
                .canModifyMedication(link.getCanModifyMedication())
                .build();
    }

    private DoctorPatientResponse mapToDoctorPatientResponse(DoctorPatient dp) {
        Doctor doctor = dp.getDoctor();
        User patient = dp.getPatient();

        return DoctorPatientResponse.builder()
                .id(dp.getId())
                .doctorId(doctor.getId())
                .doctorName(doctor.getName())
                .doctorSpecialty(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : doctor.getSpecialtyRaw())
                .doctorImageUrl(doctor.getImageUrl())
                .patientId(patient.getId())
                .patientName(patient.getName())
                .patientEmail(patient.getEmail())
                .patientPhone(patient.getPhone())
                .status(dp.getStatus())
                .canModifyMedication(dp.getCanModifyMedication())
                .notes(dp.getNotes())
                .createdAt(dp.getCreatedAt())
                .build();
    }

    private MedicationModificationRequestResponse mapToModificationRequestResponse(MedicationModificationRequest req) {
        Doctor doctor = req.getDoctor();
        User patient = req.getPatient();
        Medication medication = req.getMedication();

        return MedicationModificationRequestResponse.builder()
                .id(req.getId())
                .doctorId(doctor.getId())
                .doctorName(doctor.getName())
                .doctorSpecialty(doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : doctor.getSpecialtyRaw())
                .doctorImageUrl(doctor.getImageUrl())
                .patientId(patient.getId())
                .patientName(patient.getName())
                .patientEmail(patient.getEmail())
                .medicationId(medication != null ? medication.getId() : null)
                .medicationName(medication != null ? medication.getName() : null)
                .requestType(req.getRequestType())
                .message(req.getMessage())
                .proposedChanges(req.getProposedChanges())
                .status(req.getStatus())
                .patientResponseMessage(req.getPatientResponseMessage())
                .respondedAt(req.getRespondedAt())
                .expiresAt(req.getExpiresAt())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
