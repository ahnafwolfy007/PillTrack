package com.pilltrack.controller;

import com.pilltrack.dto.response.*;
import com.pilltrack.service.MedicineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
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
            @PageableDefault(size = 20, sort = "brandName", direction = Sort.Direction.ASC) Pageable pageable) {
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
    @Operation(summary = "Search medicines by name, generic, or strength")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> searchMedicines(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.searchMedicines(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/type/{type}")
    @Operation(summary = "Get medicines by type (allopathic, herbal, etc.)")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getMedicinesByType(
            @PathVariable String type,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getMedicinesByType(type, pageable);
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
    
    @GetMapping("/dosage-form/{dosageForm}")
    @Operation(summary = "Get medicines by dosage form (Tablet, Syrup, etc.)")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getMedicinesByDosageForm(
            @PathVariable String dosageForm,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getMedicinesByDosageForm(dosageForm, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}/alternatives")
    @Operation(summary = "Get medicine alternatives (same generic)")
    public ResponseEntity<ApiResponse<List<MedicineAlternativeResponse>>> getMedicineAlternatives(
            @PathVariable Long id) {
        List<MedicineAlternativeResponse> response = medicineService.getMedicineAlternatives(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/popular")
    @Operation(summary = "Get popular medicines")
    public ResponseEntity<ApiResponse<PageResponse<MedicineSummaryResponse>>> getPopularMedicines(
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineSummaryResponse> response = medicineService.getPopularMedicines(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/types")
    @Operation(summary = "Get all medicine types (categories)")
    public ResponseEntity<ApiResponse<List<String>>> getAllTypes() {
        List<String> types = medicineService.getAllTypes();
        return ResponseEntity.ok(ApiResponse.success(types));
    }
    
    @GetMapping("/dosage-forms")
    @Operation(summary = "Get all dosage forms")
    public ResponseEntity<ApiResponse<List<String>>> getAllDosageForms() {
        List<String> forms = medicineService.getAllDosageForms();
        return ResponseEntity.ok(ApiResponse.success(forms));
    }
    
    @GetMapping("/generics")
    @Operation(summary = "Get all generic names")
    public ResponseEntity<ApiResponse<List<String>>> getAllGenericNames() {
        List<String> generics = medicineService.getAllGenericNames();
        return ResponseEntity.ok(ApiResponse.success(generics));
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
