package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemResponse {
    
    private Long id;
    private Long shopMedicineId;
    
    // Medicine snapshot
    private String medicineName;
    private String medicineStrength;
    private String medicineForm;
    private String manufacturerName;
    
    // Quantity and pricing
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountPrice;
    private BigDecimal discount;
    private BigDecimal lineTotal;
}
