package com.pilltrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineManufacturerRequest {
    
    @NotBlank(message = "Manufacturer name is required")
    @Size(max = 150, message = "Name must not exceed 150 characters")
    private String name;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    private String description;
    
    @Size(max = 255, message = "Website must not exceed 255 characters")
    private String website;
    
    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;
    
    private Boolean isActive;
}
