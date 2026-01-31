package com.pilltrack.dto.response;

import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.model.enums.MedicationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationResponse {
    
    private Long id;
    private String name;
    private String genericName;
    private MedicationType type;
    private String strength;
    private String frequency;
    private String instructions;
    private String doctorAdvice;
    private String purpose;
    private String prescribingDoctor;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer currentQuantity;
    private Integer refillThreshold;
    private Boolean isLowStock;
    private MedicationStatus status;
    private String notes;
    private String imageUrl;
    private Boolean isActive;
    private List<String> reminderTimes;
    private Integer reminderMinutesBefore;
    private Integer quantityPerDose;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
