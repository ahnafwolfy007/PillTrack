package com.pilltrack.dto.request;

import com.pilltrack.model.enums.MedicationType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationRequest {
    
    @NotBlank(message = "Medication name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;
    
    @Size(max = 100, message = "Generic name must not exceed 100 characters")
    private String genericName;
    
    @NotNull(message = "Medication type is required")
    private MedicationType type;
    
    @NotBlank(message = "Strength/dosage is required")
    @Size(max = 50, message = "Strength must not exceed 50 characters")
    private String strength;
    
    @NotBlank(message = "Frequency is required")
    @Size(max = 50, message = "Frequency must not exceed 50 characters")
    private String frequency;
    
    @Size(max = 500, message = "Instructions must not exceed 500 characters")
    private String instructions;
    
    @Size(max = 1000, message = "Doctor advice must not exceed 1000 characters")
    private String doctorAdvice;
    
    @Size(max = 500, message = "Purpose must not exceed 500 characters")
    private String purpose;
    
    @Size(max = 100, message = "Prescribing doctor must not exceed 100 characters")
    private String prescribingDoctor;
    
    private LocalDate startDate;
    private LocalDate endDate;
    
    @Min(value = 0, message = "Quantity must be non-negative")
    private Integer currentQuantity;
    
    @Min(value = 1, message = "Refill threshold must be at least 1")
    private Integer refillThreshold;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    // Reminder times in HH:mm format
    private List<String> reminderTimes;
    
    // Minutes before the scheduled time to send reminder (5, 10, 15, 30)
    @Min(value = 0, message = "Reminder minutes must be non-negative")
    private Integer reminderMinutesBefore;
    
    // Number of pills/units taken per dose
    @Min(value = 1, message = "Quantity per dose must be at least 1")
    private Integer quantityPerDose;
}
