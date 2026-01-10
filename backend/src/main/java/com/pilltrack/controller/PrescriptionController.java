package com.pilltrack.controller;

import com.pilltrack.dto.request.PrescriptionRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.dto.response.PrescriptionResponse;
import com.pilltrack.service.PrescriptionService;
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
@RequestMapping("/api/v1/prescriptions")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Prescriptions", description = "Prescription management endpoints")
public class PrescriptionController {
    
    private final PrescriptionService prescriptionService;
    
    @GetMapping
    @Operation(summary = "Get current user's prescriptions")
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionResponse>>> getMyPrescriptions(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PrescriptionResponse> response = prescriptionService.getCurrentUserPrescriptions(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get prescription by ID")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> getPrescriptionById(@PathVariable Long id) {
        PrescriptionResponse response = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get prescriptions for an order")
    public ResponseEntity<ApiResponse<List<PrescriptionResponse>>> getPrescriptionsByOrder(@PathVariable Long orderId) {
        List<PrescriptionResponse> response = prescriptionService.getPrescriptionsByOrder(orderId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "Upload a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> uploadPrescription(
            @Valid @RequestBody PrescriptionRequest request) {
        PrescriptionResponse response = prescriptionService.uploadPrescription(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Prescription uploaded successfully"));
    }
    
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a prescription")
    public ResponseEntity<ApiResponse<Void>> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Prescription deleted successfully"));
    }
    
    // Admin/Shop Owner endpoints
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SHOP_OWNER')")
    @Operation(summary = "Get pending prescriptions for verification")
    public ResponseEntity<ApiResponse<PageResponse<PrescriptionResponse>>> getPendingPrescriptions(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<PrescriptionResponse> response = prescriptionService.getPendingPrescriptions(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SHOP_OWNER')")
    @Operation(summary = "Verify a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> verifyPrescription(@PathVariable Long id) {
        PrescriptionResponse response = prescriptionService.verifyPrescription(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Prescription verified successfully"));
    }
    
    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SHOP_OWNER')")
    @Operation(summary = "Reject a prescription")
    public ResponseEntity<ApiResponse<PrescriptionResponse>> rejectPrescription(
            @PathVariable Long id,
            @RequestParam String reason) {
        PrescriptionResponse response = prescriptionService.rejectPrescription(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Prescription rejected"));
    }
}
