package com.pilltrack.controller;

import com.pilltrack.dto.request.PharmacySearchRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.NearestPharmacyResponse;
import com.pilltrack.dto.response.PharmacyLocationResponse;
import com.pilltrack.service.PharmacyFinderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pharmacy-finder")
@RequiredArgsConstructor
@Tag(name = "Pharmacy Finder", description = "APIs for finding nearby pharmacies with specific medicines")
public class PharmacyFinderController {
    
    private final PharmacyFinderService pharmacyFinderService;
    
    @PostMapping("/search")
    @Operation(summary = "Find nearest pharmacy with a specific medicine")
    public ResponseEntity<ApiResponse<NearestPharmacyResponse>> searchNearestPharmacy(
            @Valid @RequestBody PharmacySearchRequest request) {
        NearestPharmacyResponse response = pharmacyFinderService.findNearestPharmacyWithMedicine(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Search completed successfully"));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Find nearest pharmacy with a specific medicine (GET)")
    public ResponseEntity<ApiResponse<NearestPharmacyResponse>> searchNearestPharmacyGet(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam String medicine,
            @RequestParam(defaultValue = "10.0") Double radiusKm,
            @RequestParam(defaultValue = "20") Integer maxResults) {
        
        PharmacySearchRequest request = PharmacySearchRequest.builder()
                .userLatitude(latitude)
                .userLongitude(longitude)
                .medicineName(medicine)
                .maxRadiusKm(radiusKm)
                .maxResults(maxResults)
                .build();
        
        NearestPharmacyResponse response = pharmacyFinderService.findNearestPharmacyWithMedicine(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Search completed successfully"));
    }
    
    @GetMapping("/locations")
    @Operation(summary = "Get all pharmacy locations for map display")
    public ResponseEntity<ApiResponse<List<PharmacyLocationResponse>>> getAllPharmacyLocations() {
        List<PharmacyLocationResponse> locations = pharmacyFinderService.getAllPharmacyLocations();
        return ResponseEntity.ok(ApiResponse.success(locations, "Pharmacy locations retrieved"));
    }
    
    @GetMapping("/nearby")
    @Operation(summary = "Get pharmacies near a specific location")
    public ResponseEntity<ApiResponse<List<PharmacyLocationResponse>>> getNearbyPharmacies(
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestParam(defaultValue = "5.0") Double radiusKm) {
        List<PharmacyLocationResponse> locations = pharmacyFinderService.getPharmaciesNearLocation(latitude, longitude, radiusKm);
        return ResponseEntity.ok(ApiResponse.success(locations, "Nearby pharmacies retrieved"));
    }
    
    @GetMapping("/suggestions")
    @Operation(summary = "Get medicine name suggestions for autocomplete")
    public ResponseEntity<ApiResponse<List<String>>> getMedicineSuggestions(
            @RequestParam String query) {
        List<String> suggestions = pharmacyFinderService.getMedicineSuggestions(query);
        return ResponseEntity.ok(ApiResponse.success(suggestions, "Suggestions retrieved"));
    }
}
