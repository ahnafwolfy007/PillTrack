package com.pilltrack.service;

import com.pilltrack.dto.response.PatientSummaryResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.DoctorPatient;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.NotificationType;
import com.pilltrack.repository.DoctorPatientRepository;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.UserRepository;
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
            .createdAt(LocalDateTime.now())
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
                .build();
    }
}
