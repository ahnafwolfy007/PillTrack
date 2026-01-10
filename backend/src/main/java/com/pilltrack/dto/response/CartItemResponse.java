package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemResponse {
    
    private Long id;
    private Long shopMedicineId;
    
    // Shop info
    private Long shopId;
    private String shopName;
    
    // Medicine info
    private Long medicineId;
    private String medicineName;
    private String medicineGenericName;
    private String medicineStrength;
    private String medicineForm;
    private String medicineImageUrl;
    private Boolean requiresPrescription;
    
    // Pricing
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private BigDecimal effectivePrice;
    private BigDecimal lineTotal;
    
    // Stock
    private Integer availableStock;
    private Boolean isAvailable;
    
    private LocalDateTime createdAt;
}
