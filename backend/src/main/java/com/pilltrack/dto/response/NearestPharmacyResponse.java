package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NearestPharmacyResponse {
    
    // The medicine being searched
    private String searchedMedicine;
    
    // User's location
    private Double userLatitude;
    private Double userLongitude;
    
    // The nearest pharmacy with the medicine
    private PharmacySearchResponse nearestPharmacy;
    
    // All matching pharmacies (sorted by distance)
    private List<PharmacySearchResponse> allResults;
    
    // Statistics
    private Integer totalFound;
    private Double searchRadiusKm;
}
