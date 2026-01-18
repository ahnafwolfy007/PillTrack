package com.pilltrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacySearchRequest {
    
    @NotNull(message = "User latitude is required")
    private Double userLatitude;
    
    @NotNull(message = "User longitude is required")
    private Double userLongitude;
    
    @NotBlank(message = "Medicine name is required")
    private String medicineName;
    
    // Optional: Maximum search radius in kilometers (default 10km)
    @Builder.Default
    private Double maxRadiusKm = 10.0;
    
    // Optional: Maximum number of results
    @Builder.Default
    private Integer maxResults = 20;
}
