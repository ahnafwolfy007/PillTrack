package com.pilltrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderRequest {
    
    @NotEmpty(message = "Order must contain at least one item")
    private List<OrderItemRequest> items;
    
    // Shipping Address
    @NotBlank(message = "Shipping name is required")
    @Size(max = 100, message = "Shipping name must not exceed 100 characters")
    private String shippingName;
    
    @NotBlank(message = "Shipping phone is required")
    @Size(max = 20, message = "Shipping phone must not exceed 20 characters")
    private String shippingPhone;
    
    @NotBlank(message = "Shipping address is required")
    private String shippingAddress;
    
    @NotBlank(message = "Shipping city is required")
    @Size(max = 100, message = "Shipping city must not exceed 100 characters")
    private String shippingCity;
    
    @Size(max = 100, message = "Shipping area must not exceed 100 characters")
    private String shippingArea;
    
    @Size(max = 20, message = "Shipping postal code must not exceed 20 characters")
    private String shippingPostalCode;
    
    // Prescription
    private Long prescriptionId;
    
    // Notes
    @Size(max = 500, message = "Customer notes must not exceed 500 characters")
    private String customerNotes;
}
