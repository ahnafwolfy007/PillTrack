package com.pilltrack.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopMedicineRequest {
    
    @NotNull(message = "Medicine ID is required")
    private Long medicineId;
    
    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;
    
    @DecimalMin(value = "0.01", message = "Discount price must be greater than 0")
    private BigDecimal discountPrice;
    
    @NotNull(message = "Stock quantity is required")
    @Min(value = 0, message = "Stock quantity must be non-negative")
    private Integer stockQuantity;
    
    @Min(value = 1, message = "Minimum stock alert must be at least 1")
    private Integer minStockAlert;
    
    @Size(max = 50, message = "Batch number must not exceed 50 characters")
    private String batchNumber;
    
    private LocalDate expiryDate;
    private LocalDate manufactureDate;
    
    private Boolean isAvailable;
    private Boolean isFeatured;
}
