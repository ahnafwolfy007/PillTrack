package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {
    
    private Long id;
    
    // Basic Information from CSV
    private Integer brandId;
    private String brandName;
    private String type;  // allopathic, herbal, etc.
    private String slug;
    private String dosageForm;
    private String genericName;
    private String strength;
    
    // Manufacturer
    private MedicineManufacturerResponse manufacturer;
    private String manufacturerName;
    
    // Packaging & Pricing from CSV
    private String unitQuantity;
    private String containerType;
    private BigDecimal unitPrice;
    private BigDecimal packQuantity;
    private BigDecimal packPrice;
    
    // Status
    private Boolean isActive;
    private Integer viewCount;
    
    // Alternatives (medicines with same generic name)
    private List<MedicineAlternativeResponse> alternatives;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
