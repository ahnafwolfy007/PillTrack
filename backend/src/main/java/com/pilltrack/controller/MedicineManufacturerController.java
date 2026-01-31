package com.pilltrack.controller;

import com.pilltrack.dto.request.MedicineManufacturerRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.MedicineManufacturerResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.service.MedicineManufacturerService;
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
@RequestMapping("/api/v1/manufacturers")
@RequiredArgsConstructor
@Tag(name = "Medicine Manufacturers", description = "Medicine manufacturer management endpoints")
public class MedicineManufacturerController {
    
    private final MedicineManufacturerService manufacturerService;
    
    @GetMapping
    @Operation(summary = "Get all manufacturers")
    public ResponseEntity<ApiResponse<List<MedicineManufacturerResponse>>> getAllManufacturers() {
        List<MedicineManufacturerResponse> response = manufacturerService.getAllManufacturers();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/paged")
    @Operation(summary = "Get manufacturers with pagination")
    public ResponseEntity<ApiResponse<PageResponse<MedicineManufacturerResponse>>> getManufacturersPaged(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineManufacturerResponse> response = manufacturerService.getManufacturersPaged(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get manufacturer by ID")
    public ResponseEntity<ApiResponse<MedicineManufacturerResponse>> getManufacturerById(@PathVariable Long id) {
        MedicineManufacturerResponse response = manufacturerService.getManufacturerById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search manufacturers by name")
    public ResponseEntity<ApiResponse<PageResponse<MedicineManufacturerResponse>>> searchManufacturers(
            @RequestParam String query,
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineManufacturerResponse> response = manufacturerService.searchManufacturers(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new manufacturer (Admin only)")
    public ResponseEntity<ApiResponse<MedicineManufacturerResponse>> createManufacturer(
            @Valid @RequestBody MedicineManufacturerRequest request) {
        MedicineManufacturerResponse response = manufacturerService.createManufacturer(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Manufacturer created successfully"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a manufacturer (Admin only)")
    public ResponseEntity<ApiResponse<MedicineManufacturerResponse>> updateManufacturer(
            @PathVariable Long id,
            @Valid @RequestBody MedicineManufacturerRequest request) {
        MedicineManufacturerResponse response = manufacturerService.updateManufacturer(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Manufacturer updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a manufacturer (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteManufacturer(@PathVariable Long id) {
        manufacturerService.deleteManufacturer(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Manufacturer deleted successfully"));
    }
}
