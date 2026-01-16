package com.pilltrack.service;

import com.pilltrack.dto.request.DoseLogRequest;
import com.pilltrack.dto.response.DoseLogResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.DoseLog;
import com.pilltrack.model.entity.Medication;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.DoseStatus;
import com.pilltrack.repository.DoseLogRepository;
import com.pilltrack.repository.MedicationRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DoseLogService {
    
    private final DoseLogRepository doseLogRepository;
    private final MedicationRepository medicationRepository;
    private final CurrentUser currentUser;
    
    @Transactional(readOnly = true)
    public List<DoseLogResponse> getTodaysDoses() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return doseLogRepository.findTodaysDosesByUserId(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<DoseLogResponse> getDoseLogsByDateRange(LocalDate startDate, LocalDate endDate) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        return doseLogRepository.findByUserIdAndDateRange(user.getId(), start, end).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PageResponse<DoseLogResponse> getDoseLogsByMedication(Long medicationId, Pageable pageable) {
        verifyMedicationOwnership(medicationId);
        
        Page<DoseLog> doseLogsPage = doseLogRepository.findByMedicationId(medicationId, pageable);
        return buildPageResponse(doseLogsPage);
    }
    
    @Transactional
    public DoseLogResponse logDose(DoseLogRequest request) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Medication medication = medicationRepository.findById(request.getMedicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", request.getMedicationId()));
        
        if (!medication.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to log doses for this medication");
        }
        
        DoseLog doseLog = DoseLog.builder()
                .medication(medication)
                .scheduledTime(request.getScheduledTime())
                .takenTime(request.getTakenTime() != null ? request.getTakenTime() : LocalDateTime.now())
                .status(request.getStatus())
                .notes(request.getNotes())
                .build();
        
        doseLog = doseLogRepository.save(doseLog);
        
        // Update medication inventory if dose was taken (using quantityPerDose)
        if (request.getStatus() == DoseStatus.TAKEN) {
            int quantityPerDose = medication.getQuantityPerDose() != null ? medication.getQuantityPerDose() : 1;
            if (medication.getInventory() >= quantityPerDose) {
                medication.setInventory(medication.getInventory() - quantityPerDose);
                medicationRepository.save(medication);
                log.info("Reduced inventory by {} for medication: {}", quantityPerDose, medication.getName());
            }
        }
        
        log.info("Dose logged for medication: {} with status: {}", medication.getName(), request.getStatus());
        
        return mapToResponse(doseLog);
    }
    
    @Transactional
    public DoseLogResponse updateDoseLog(Long id, DoseLogRequest request) {
        DoseLog doseLog = getDoseLogAndVerifyOwnership(id);
        
        if (request.getTakenTime() != null) {
            doseLog.setTakenTime(request.getTakenTime());
        }
        if (request.getStatus() != null) {
            doseLog.setStatus(request.getStatus());
        }
        if (request.getNotes() != null) {
            doseLog.setNotes(request.getNotes());
        }
        
        doseLog = doseLogRepository.save(doseLog);
        
        log.info("Dose log updated: {}", id);
        
        return mapToResponse(doseLog);
    }
    
    @Transactional
    public DoseLogResponse markDoseTaken(Long id) {
        DoseLog doseLog = getDoseLogAndVerifyOwnership(id);
        doseLog.setStatus(DoseStatus.TAKEN);
        doseLog.setTakenTime(LocalDateTime.now());
        
        // Update medication inventory using quantityPerDose
        Medication medication = doseLog.getMedication();
        int quantityPerDose = medication.getQuantityPerDose() != null ? medication.getQuantityPerDose() : 1;
        if (medication.getInventory() >= quantityPerDose) {
            medication.setInventory(medication.getInventory() - quantityPerDose);
            medicationRepository.save(medication);
            log.info("Reduced inventory by {} for medication: {}, remaining: {}", 
                    quantityPerDose, medication.getName(), medication.getInventory());
        }
        
        doseLog = doseLogRepository.save(doseLog);
        
        log.info("Dose marked as taken for medication: {}", medication.getName());
        
        return mapToResponse(doseLog);
    }
    
    @Transactional
    public DoseLogResponse markDoseSkipped(Long id, String reason) {
        DoseLog doseLog = getDoseLogAndVerifyOwnership(id);
        doseLog.setStatus(DoseStatus.SKIPPED);
        doseLog.setNotes(reason);
        
        doseLog = doseLogRepository.save(doseLog);
        
        log.info("Dose marked as skipped for medication: {}", doseLog.getMedication().getName());
        
        return mapToResponse(doseLog);
    }
    
    @Transactional
    public DoseLogResponse markDoseMissed(Long id) {
        DoseLog doseLog = getDoseLogAndVerifyOwnership(id);
        doseLog.setStatus(DoseStatus.MISSED);
        
        doseLog = doseLogRepository.save(doseLog);
        
        log.info("Dose marked as missed for medication: {}", doseLog.getMedication().getName());
        
        return mapToResponse(doseLog);
    }
    
    @Transactional(readOnly = true)
    public long getAdherencePercentage(Long medicationId, LocalDate startDate, LocalDate endDate) {
        verifyMedicationOwnership(medicationId);
        
        User user = currentUser.getUser();
        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);
        
        long totalDoses = doseLogRepository.countByUserIdAndDateRangeAndStatus(
                user.getId(), start, end, DoseStatus.TAKEN);
        long missedDoses = doseLogRepository.countByUserIdAndDateRangeAndStatus(
                user.getId(), start, end, DoseStatus.MISSED);
        long skippedDoses = doseLogRepository.countByUserIdAndDateRangeAndStatus(
                user.getId(), start, end, DoseStatus.SKIPPED);
        
        long totalScheduled = totalDoses + missedDoses + skippedDoses;
        
        if (totalScheduled == 0) {
            return 100;
        }
        
        return (totalDoses * 100) / totalScheduled;
    }
    
    private DoseLog getDoseLogAndVerifyOwnership(Long id) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        DoseLog doseLog = doseLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DoseLog", "id", id));
        
        if (!doseLog.getMedication().getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this dose log");
        }
        
        return doseLog;
    }
    
    private void verifyMedicationOwnership(Long medicationId) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Medication medication = medicationRepository.findById(medicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Medication", "id", medicationId));
        
        if (!medication.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this medication");
        }
    }
    
    private DoseLogResponse mapToResponse(DoseLog doseLog) {
        Medication medication = doseLog.getMedication();
        return DoseLogResponse.builder()
                .id(doseLog.getId())
                .medicationId(medication.getId())
                .medicationName(medication.getName())
                .medicationType(medication.getType().name())
                .strength(medication.getDosage())
                .scheduledTime(doseLog.getScheduledTime())
                .takenTime(doseLog.getTakenTime())
                .status(doseLog.getStatus())
                .notes(doseLog.getNotes())
                .createdAt(doseLog.getCreatedAt())
                .currentInventory(medication.getInventory())
                .quantityPerDose(medication.getQuantityPerDose())
                .instructions(medication.getInstructions())
                .build();
    }
    
    private PageResponse<DoseLogResponse> buildPageResponse(Page<DoseLog> doseLogsPage) {
        List<DoseLogResponse> doseLogs = doseLogsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<DoseLogResponse>builder()
                .content(doseLogs)
                .pageNumber(doseLogsPage.getNumber())
                .pageSize(doseLogsPage.getSize())
                .totalElements(doseLogsPage.getTotalElements())
                .totalPages(doseLogsPage.getTotalPages())
                .first(doseLogsPage.isFirst())
                .last(doseLogsPage.isLast())
                .hasNext(doseLogsPage.hasNext())
                .hasPrevious(doseLogsPage.hasPrevious())
                .build();
    }
}
