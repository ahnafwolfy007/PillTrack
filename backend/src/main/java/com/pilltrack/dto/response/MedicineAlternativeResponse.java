package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private String form;
    private String manufacturerName;
    private String imageUrl;
}
