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
public class MedicineAlternativeResponse {
    
    private Long id;
    private String brandName;
    private String genericName;
    private String slug;
    private String strength;
    private String dosageForm;
    private String manufacturerName;
    private BigDecimal unitPrice;
}
