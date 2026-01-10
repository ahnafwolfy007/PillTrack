package com.pilltrack.controller;

import com.pilltrack.dto.request.MedicineRequest;
import com.pilltrack.dto.response.*;
import com.pilltrack.service.MedicineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medicines")
@RequiredArgsConstructor
@Tag(name = "Medicines", description = "MedBase - Medicine database endpoints")
public class MedicineController {
    
    private final MedicineService medicineService;
    
    @GetMapping
    @Operation(summary = "Get all medicines with pagination")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getAllMedicines(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getAllMedicines(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get medicine by ID")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineById(@PathVariable Long id) {
        MedicineResponse response = medicineService.getMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get medicine by slug")
    public ResponseEntity<ApiResponse<MedicineResponse>> getMedicineBySlug(@PathVariable String slug) {
        MedicineResponse response = medicineService.getMedicineBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search medicines by name")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> searchMedicines(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.searchMedicines(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get medicines by category")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getMedicinesByCategory(
            @PathVariable Long categoryId,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getMedicinesByCategory(categoryId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/manufacturer/{manufacturerId}")
    @Operation(summary = "Get medicines by manufacturer")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getMedicinesByManufacturer(
            @PathVariable Long manufacturerId,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getMedicinesByManufacturer(manufacturerId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/generic/{genericName}")
    @Operation(summary = "Get medicines by generic name")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getMedicinesByGenericName(
            @PathVariable String genericName,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getMedicinesByGenericName(genericName, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}/alternatives")
    @Operation(summary = "Get medicine alternatives")
    public ResponseEntity<ApiResponse<List<MedicineAlternativeResponse>>> getMedicineAlternatives(
            @PathVariable Long id) {
        List<MedicineAlternativeResponse> response = medicineService.getMedicineAlternatives(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/otc")
    @Operation(summary = "Get OTC medicines")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getOtcMedicines(
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getOtcMedicines(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new medicine (Admin only)")
    public ResponseEntity<ApiResponse<MedicineResponse>> createMedicine(
            @Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.createMedicine(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Medicine created successfully"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a medicine (Admin only)")
    public ResponseEntity<ApiResponse<MedicineResponse>> updateMedicine(
            @PathVariable Long id,
            @Valid @RequestBody MedicineRequest request) {
        MedicineResponse response = medicineService.updateMedicine(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Medicine updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a medicine (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteMedicine(@PathVariable Long id) {
        medicineService.deleteMedicine(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Medicine deleted successfully"));
    }
}
