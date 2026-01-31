package com.pilltrack.controller;

import com.pilltrack.dto.request.MedicationRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.MedicationResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.service.MedicationService;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/medications")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Medications", description = "User medication management endpoints")
public class MedicationController {
    
    private final MedicationService medicationService;
    
    @GetMapping
    @Operation(summary = "Get all medications for current user")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> getMedications() {
        List<MedicationResponse> response = medicationService.getCurrentUserMedications();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/paged")
    @Operation(summary = "Get paginated medications for current user")
    public ResponseEntity<ApiResponse<PageResponse<MedicationResponse>>> getMedicationsPaged(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<MedicationResponse> response = medicationService.getCurrentUserMedicationsPaged(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get medication by ID")
    public ResponseEntity<ApiResponse<MedicationResponse>> getMedication(@PathVariable Long id) {
        MedicationResponse response = medicationService.getMedicationById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/low-stock")
    @Operation(summary = "Get medications with low stock")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> getLowStockMedications() {
        List<MedicationResponse> response = medicationService.getLowStockMedications();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "Create a new medication")
    public ResponseEntity<ApiResponse<MedicationResponse>> createMedication(
            @Valid @RequestBody MedicationRequest request) {
        MedicationResponse response = medicationService.createMedication(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Medication created successfully"));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a medication")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateMedication(
            @PathVariable Long id,
            @Valid @RequestBody MedicationRequest request) {
        MedicationResponse response = medicationService.updateMedication(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Medication updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a medication")
    public ResponseEntity<ApiResponse<Void>> deleteMedication(@PathVariable Long id) {
        medicationService.deleteMedication(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Medication deleted successfully"));
    }
    
    @PatchMapping("/{id}/status")
    @Operation(summary = "Update medication status")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam MedicationStatus status) {
        MedicationResponse response = medicationService.updateMedicationStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Status updated successfully"));
    }
    
    @PatchMapping("/{id}/inventory")
    @Operation(summary = "Update medication inventory")
    public ResponseEntity<ApiResponse<MedicationResponse>> updateInventory(
            @PathVariable Long id,
            @RequestParam int quantity) {
        MedicationResponse response = medicationService.updateInventory(id, quantity);
        return ResponseEntity.ok(ApiResponse.success(response, "Inventory updated successfully"));
    }
}
