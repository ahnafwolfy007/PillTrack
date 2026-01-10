package com.pilltrack.dto.request;

import com.pilltrack.model.enums.DoseStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoseLogRequest {
    
    @NotNull(message = "Medication ID is required")
    private Long medicationId;
    
    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;
    
    private LocalDateTime takenTime;
    
    @NotNull(message = "Status is required")
    private DoseStatus status;
    
    private String notes;
}
