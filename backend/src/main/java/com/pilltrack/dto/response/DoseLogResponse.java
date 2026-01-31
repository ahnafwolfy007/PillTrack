package com.pilltrack.dto.response;

import com.pilltrack.model.enums.DoseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoseLogResponse {
    
    private Long id;
    private Long medicationId;
    private String medicationName;
    private String medicationType;
    private String strength;
    private LocalDateTime scheduledTime;
    private LocalDateTime takenTime;
    private DoseStatus status;
    private String notes;
    private LocalDateTime createdAt;
    
    // Inventory info after action
    private Integer currentInventory;
    private Integer quantityPerDose;
    private String instructions;
}
