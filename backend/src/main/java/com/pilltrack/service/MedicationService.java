package com.pilltrack.service;

import com.pilltrack.dto.request.MedicationRequest;
import com.pilltrack.dto.response.MedicationResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.model.enums.NotificationType;
import com.pilltrack.repository.DoctorPatientRepository;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.MedicationRepository;
import com.pilltrack.repository.UserRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MedicationService {
    
    private final MedicationRepository medicationRepository;
    private final CurrentUser currentUser;
    private final ReminderService reminderService;
    private final DoctorRepository doctorRepository;
    private final DoctorPatientRepository doctorPatientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    @Transactional(readOnly = true)
    public List<MedicationResponse> getCurrentUserMedications() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return medicationRepository.findActiveByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PageResponse<MedicationResponse> getCurrentUserMedicationsPaged(Pageable pageable) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Page<Medication> medicationsPage = medicationRepository.findByUserId(user.getId(), pageable);
        return buildPageResponse(medicationsPage);
    }
    
    @Transactional(readOnly = true)
    public MedicationResponse getMedicationById(Long id) {
        Medication medication = getMedicationAndVerifyOwnership(id);
        return mapToResponse(medication);
    }
    
    @Transactional(readOnly = true)
    public List<MedicationResponse> getLowStockMedications() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return medicationRepository.findLowStockByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public MedicationResponse createMedication(MedicationRequest request) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        // Parse frequency from string to integer (doses per day)
        Integer frequencyInt = parseFrequency(request.getFrequency());
        
        Medication medication = Medication.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType())
                .dosage(request.getStrength() != null ? request.getStrength() : "N/A")
                .frequency(frequencyInt)
                .instructions(request.getInstructions())
                .doctorAdvice(request.getDoctorAdvice())
                .prescribedBy(request.getPrescribingDoctor())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .inventory(request.getCurrentQuantity() != null ? request.getCurrentQuantity() : 0)
                .quantityPerDose(request.getQuantityPerDose() != null ? request.getQuantityPerDose() : 1)
                .reminderMinutesBefore(request.getReminderMinutesBefore() != null ? request.getReminderMinutesBefore() : 5)
                .imageUrl(request.getImageUrl())
                .status(MedicationStatus.ACTIVE)
                .build();
        
        medication = medicationRepository.save(medication);
        
        // Create reminders if reminder times are provided
        if (request.getReminderTimes() != null && !request.getReminderTimes().isEmpty()) {
            reminderService.createRemindersForMedication(
                    medication, 
                    request.getReminderTimes(),
                    request.getReminderMinutesBefore()
            );
        }
        
        log.info("Medication created: {} for user: {}", medication.getName(), user.getEmail());
        
        return mapToResponse(medication);
    }
    
    @Transactional
    public MedicationResponse updateMedication(Long id, MedicationRequest request) {
        Medication medication = getMedicationAndVerifyOwnership(id);
        
        if (request.getName() != null) {
            medication.setName(request.getName());
        }
        if (request.getType() != null) {
            medication.setType(request.getType());
        }
        if (request.getStrength() != null) {
            medication.setDosage(request.getStrength());
        }
        if (request.getFrequency() != null) {
            medication.setFrequency(parseFrequency(request.getFrequency()));
        }
        if (request.getInstructions() != null) {
            medication.setInstructions(request.getInstructions());
        }
        if (request.getDoctorAdvice() != null) {
            medication.setDoctorAdvice(request.getDoctorAdvice());
        }
        if (request.getPrescribingDoctor() != null) {
            medication.setPrescribedBy(request.getPrescribingDoctor());
        }
        if (request.getStartDate() != null) {
            medication.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            medication.setEndDate(request.getEndDate());
        }
        if (request.getCurrentQuantity() != null) {
            medication.setInventory(request.getCurrentQuantity());
        }
        if (request.getImageUrl() != null) {
            medication.setImageUrl(request.getImageUrl());
        }
        
        // Update reminders if provided
        if (request.getReminderTimes() != null) {
            reminderService.updateRemindersForMedication(
                    medication, 
                    request.getReminderTimes(),
                    request.getReminderMinutesBefore()
            );
        }
        
        medication = medicationRepository.save(medication);
        log.info("Medication updated: {}", medication.getName());
        
        return mapToResponse(medication);
    }
    
    @Transactional
    public void deleteMedication(Long id) {
        Medication medication = getMedicationAndVerifyOwnership(id);
        
        // Deactivate reminders
        reminderService.deactivateRemindersForMedication(id);
        
        medication.setStatus(MedicationStatus.DISCONTINUED);
        medicationRepository.save(medication);
        
        log.info("Medication deleted (deactivated): {}", medication.getName());
    }
    
    @Transactional
    public MedicationResponse updateMedicationStatus(Long id, MedicationStatus status) {
        Medication medication = getMedicationAndVerifyOwnership(id);
        medication.setStatus(status);
        medication = medicationRepository.save(medication);
        
        log.info("Medication status updated: {} -> {}", medication.getName(), status);
        
        return mapToResponse(medication);
    }
    
    @Transactional
    public MedicationResponse updateInventory(Long id, int quantity) {
        Medication medication = getMedicationAndVerifyOwnership(id);
        medication.setInventory(quantity);
        medication = medicationRepository.save(medication);
        
        log.info("Medication inventory updated: {} -> {} units", medication.getName(), quantity);
        
        return mapToResponse(medication);
    }

    @Transactional(readOnly = true)
    public List<MedicationResponse> getMedicationsForPatient(Long patientId) {
        User patient = getPatientForCurrentDoctor(patientId);
        return medicationRepository.findActiveByUserId(patient.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public MedicationResponse createMedicationForPatient(Long patientId, MedicationRequest request) {
        User patient = getPatientForCurrentDoctor(patientId);
        Doctor doctor = getCurrentDoctor();
        Integer frequencyInt = parseFrequency(request.getFrequency());

        Medication medication = Medication.builder()
                .user(patient)
                .name(request.getName())
                .type(request.getType())
                .dosage(request.getStrength() != null ? request.getStrength() : "N/A")
                .frequency(frequencyInt)
                .instructions(request.getInstructions())
                .doctorAdvice(request.getDoctorAdvice())
                .prescribedBy(request.getPrescribingDoctor() != null ? request.getPrescribingDoctor() : doctor.getName())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .inventory(request.getCurrentQuantity() != null ? request.getCurrentQuantity() : 0)
                .quantityPerDose(request.getQuantityPerDose() != null ? request.getQuantityPerDose() : 1)
                .reminderMinutesBefore(request.getReminderMinutesBefore() != null ? request.getReminderMinutesBefore() : 5)
                .imageUrl(request.getImageUrl())
                .status(MedicationStatus.ACTIVE)
                .build();

        medication = medicationRepository.save(medication);

        if (request.getReminderTimes() != null && !request.getReminderTimes().isEmpty()) {
            reminderService.createRemindersForMedication(
                    medication,
                    request.getReminderTimes(),
                    request.getReminderMinutesBefore()
            );
        }

        notificationService.sendMedicationUpdateByDoctor(patient.getId(), medication.getName(), doctor.getName(), true);
        log.info("Doctor {} created medication {} for patient {}", doctor.getId(), medication.getId(), patient.getId());
        return mapToResponse(medication);
    }

    @Transactional
    public MedicationResponse updateMedicationForPatient(Long patientId, Long medicationId, MedicationRequest request) {
        User patient = getPatientForCurrentDoctor(patientId);
        Doctor doctor = getCurrentDoctor();
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", medicationId));

        verifyMedicationBelongsToPatient(medication, patient.getId());

        if (request.getName() != null) {
            medication.setName(request.getName());
        }
        if (request.getType() != null) {
            medication.setType(request.getType());
        }
        if (request.getStrength() != null) {
            medication.setDosage(request.getStrength());
        }
        if (request.getFrequency() != null) {
            medication.setFrequency(parseFrequency(request.getFrequency()));
        }
        if (request.getInstructions() != null) {
            medication.setInstructions(request.getInstructions());
        }
        if (request.getDoctorAdvice() != null) {
            medication.setDoctorAdvice(request.getDoctorAdvice());
        }
        if (request.getPrescribingDoctor() != null) {
            medication.setPrescribedBy(request.getPrescribingDoctor());
        }
        if (request.getStartDate() != null) {
            medication.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            medication.setEndDate(request.getEndDate());
        }
        if (request.getCurrentQuantity() != null) {
            medication.setInventory(request.getCurrentQuantity());
        }
        if (request.getImageUrl() != null) {
            medication.setImageUrl(request.getImageUrl());
        }

        if (request.getReminderTimes() != null) {
            reminderService.updateRemindersForMedication(
                    medication,
                    request.getReminderTimes(),
                    request.getReminderMinutesBefore()
            );
        }

        medication = medicationRepository.save(medication);
        notificationService.sendMedicationUpdateByDoctor(patient.getId(), medication.getName(), doctor.getName(), false);
        log.info("Doctor {} updated medication {} for patient {}", doctor.getId(), medication.getId(), patient.getId());
        return mapToResponse(medication);
    }
    
    private Integer parseFrequency(String frequency) {
        if (frequency == null) return 1;
        try {
            return Integer.parseInt(frequency);
        } catch (NumberFormatException e) {
            // Default to 1 if not parseable
            return 1;
        }
    }

    private User getPatientForCurrentDoctor(Long patientId) {
        Doctor doctor = getCurrentDoctor();
        User patient = userRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", patientId));

        if (!doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), patientId)) {
            throw new AccessDeniedException("Patient is not assigned to the current doctor");
        }

        return patient;
    }

    private Doctor getCurrentDoctor() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }

        if (!currentUser.isDoctor()) {
            throw new AccessDeniedException("Only doctors can manage patient medications");
        }

        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "userId", user.getId()));
    }

    private void verifyMedicationBelongsToPatient(Medication medication, Long patientId) {
        if (!medication.getUser().getId().equals(patientId)) {
            throw new AccessDeniedException("Medication does not belong to the specified patient");
        }
    }
    
    private Medication getMedicationAndVerifyOwnership(Long id) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Medication medication = medicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", id));
        
        if (!medication.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this medication");
        }
        
        return medication;
    }
    
    private MedicationResponse mapToResponse(Medication medication) {
        List<String> reminderTimes = medication.getReminders().stream()
                .filter(r -> r.getIsActive())
                .map(r -> r.getScheduleInfo())
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toList());
        
        // Calculate isLowStock with default threshold of 7 days
        boolean isLowStock = medication.isLowStock(7);
        
        // Get reminder minutes before from first active reminder or from entity
        Integer reminderMinutes = medication.getReminderMinutesBefore();
        if (reminderMinutes == null || reminderMinutes == 0) {
            reminderMinutes = medication.getReminders().stream()
                    .filter(r -> r.getIsActive() && r.getMinutesBefore() != null)
                    .map(r -> r.getMinutesBefore())
                    .findFirst()
                    .orElse(0);
        }
        
        return MedicationResponse.builder()
                .id(medication.getId())
                .name(medication.getName())
                .genericName(null) // Entity doesn't have genericName
                .type(medication.getType())
                .strength(medication.getDosage())
                .frequency(String.valueOf(medication.getFrequency()))
                .instructions(medication.getInstructions())
                .doctorAdvice(medication.getDoctorAdvice())
                .purpose(null) // Entity doesn't have purpose
                .prescribingDoctor(medication.getPrescribedBy())
                .startDate(medication.getStartDate())
                .endDate(medication.getEndDate())
                .currentQuantity(medication.getInventory())
                .refillThreshold(7) // Default threshold
                .isLowStock(isLowStock)
                .status(medication.getStatus())
                .notes(null) // Entity doesn't have notes
                .imageUrl(medication.getImageUrl())
                .isActive(medication.getStatus() == MedicationStatus.ACTIVE)
                .reminderTimes(reminderTimes)
                .reminderMinutesBefore(reminderMinutes)
                .quantityPerDose(medication.getQuantityPerDose() != null ? medication.getQuantityPerDose() : 1)
                .createdAt(medication.getCreatedAt())
                .updatedAt(medication.getUpdatedAt())
                .build();
    }
    
    private PageResponse<MedicationResponse> buildPageResponse(Page<Medication> medicationsPage) {
        List<MedicationResponse> medications = medicationsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<MedicationResponse>builder()
                .content(medications)
                .pageNumber(medicationsPage.getNumber())
                .pageSize(medicationsPage.getSize())
                .totalElements(medicationsPage.getTotalElements())
                .totalPages(medicationsPage.getTotalPages())
                .first(medicationsPage.isFirst())
                .last(medicationsPage.isLast())
                .hasNext(medicationsPage.hasNext())
                .hasPrevious(medicationsPage.hasPrevious())
                .build();
    }
}
