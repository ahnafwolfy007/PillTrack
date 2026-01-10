package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineManufacturerResponse {
    
    private Long id;
    private String name;
    private String country;
    private String description;
    private String website;
    private String logoUrl;
    private Boolean isActive;
    private Long medicineCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
