package com.pilltrack.dto.request;

import com.pilltrack.model.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private OrderStatus status;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
    
    @Size(max = 500, message = "Cancellation reason must not exceed 500 characters")
    private String cancellationReason;
}
