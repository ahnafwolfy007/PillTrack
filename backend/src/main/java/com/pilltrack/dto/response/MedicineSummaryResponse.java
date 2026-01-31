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
public class MedicineSummaryResponse {
    
    private Long id;
    private Integer brandId;
    private String brandName;
    private String genericName;
    private String slug;
    private String type;  // allopathic, herbal, etc. - used as category
    private String dosageForm;
    private String strength;
    private String manufacturerName;
    private String containerType;
    private BigDecimal unitPrice;
    private BigDecimal packPrice;
}
