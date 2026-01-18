package com.pilltrack.controller;

import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.DoctorResponse;
import com.pilltrack.dto.response.SpecialtyResponse;
import com.pilltrack.service.DoctorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor", description = "Doctor management APIs")
public class DoctorController {
    
    private final DoctorService doctorService;
    
    @GetMapping
    @Operation(summary = "Get all doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search doctors by name, specialty, or concentration")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> searchDoctors(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchDoctors(query)));
    }
    
    @GetMapping("/specialty/{specialtyId}")
    @Operation(summary = "Get doctors by specialty ID")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsBySpecialty(@PathVariable Long specialtyId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialty(specialtyId)));
    }
    
    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getTopRatedDoctors(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getTopRatedDoctors(limit)));
    }
    
    @GetMapping("/locations")
    @Operation(summary = "Get all available locations")
    public ResponseEntity<ApiResponse<List<String>>> getAllLocations() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllLocations()));
    }
    
    @GetMapping("/location/{location}")
    @Operation(summary = "Get doctors by location")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsByLocation(@PathVariable String location) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsByLocation(location)));
    }
    
    @GetMapping("/specialties")
    @Operation(summary = "Get all specialties from Specialty table")
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> getAllSpecialties() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllSpecialties()));
    }
    
    @GetMapping("/specialties/search")
    @Operation(summary = "Search specialties from Specialty table")
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> searchSpecialties(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchSpecialties(query)));
    }
    
    @GetMapping("/raw-specialties")
    @Operation(summary = "Get all unique specialties directly from doctor records with counts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllRawSpecialties() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllRawSpecialties()));
    }
    
    @GetMapping("/raw-specialties/search")
    @Operation(summary = "Search specialties from doctor records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchRawSpecialties(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchRawSpecialties(query)));
    }
    
    @GetMapping("/by-specialty-name/{specialtyName}")
    @Operation(summary = "Get doctors by specialty name (raw)")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsBySpecialtyName(@PathVariable String specialtyName) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialtyRaw(specialtyName)));
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get doctor statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getStats()));
    }
}
