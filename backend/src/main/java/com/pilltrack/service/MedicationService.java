package com.pilltrack.service;

import com.pilltrack.dto.request.MedicationRequest;
import com.pilltrack.dto.response.MedicationResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.repository.MedicationRepository;
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
                .prescribedBy(request.getPrescribingDoctor())
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .inventory(request.getCurrentQuantity() != null ? request.getCurrentQuantity() : 0)
                .imageUrl(request.getImageUrl())
                .status(MedicationStatus.ACTIVE)
                .build();
        
        medication = medicationRepository.save(medication);
        
        // Create reminders if reminder times are provided
        if (request.getReminderTimes() != null && !request.getReminderTimes().isEmpty()) {
            reminderService.createRemindersForMedication(medication, request.getReminderTimes());
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
            reminderService.updateRemindersForMedication(medication, request.getReminderTimes());
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
    
    private Integer parseFrequency(String frequency) {
        if (frequency == null) return 1;
        try {
            return Integer.parseInt(frequency);
        } catch (NumberFormatException e) {
            // Default to 1 if not parseable
            return 1;
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
        
        return MedicationResponse.builder()
                .id(medication.getId())
                .name(medication.getName())
                .genericName(null) // Entity doesn't have genericName
                .type(medication.getType())
                .strength(medication.getDosage())
                .frequency(String.valueOf(medication.getFrequency()))
                .instructions(medication.getInstructions())
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
