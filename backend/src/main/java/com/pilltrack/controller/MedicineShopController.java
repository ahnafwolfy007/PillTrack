package com.pilltrack.controller;

import com.pilltrack.dto.request.MedicineShopRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.MedicineShopResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.model.enums.ShopStatus;
import com.pilltrack.service.MedicineShopService;
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
@RequestMapping("/api/v1/shops")
@RequiredArgsConstructor
@Tag(name = "Medicine Shops", description = "Medicine shop management endpoints")
public class MedicineShopController {
    
    private final MedicineShopService shopService;
    
    @GetMapping
    @Operation(summary = "Get all active shops")
    public ResponseEntity<ApiResponse<PageResponse<MedicineShopResponse>>> getAllShops(
            @PageableDefault(size = 20, sort = "name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<MedicineShopResponse> response = shopService.getAllActiveShops(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get shop by ID")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> getShopById(@PathVariable Long id) {
        MedicineShopResponse response = shopService.getShopById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get shop by slug")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> getShopBySlug(@PathVariable String slug) {
        MedicineShopResponse response = shopService.getShopBySlug(slug);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search shops by name")
    public ResponseEntity<ApiResponse<PageResponse<MedicineShopResponse>>> searchShops(
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<MedicineShopResponse> response = shopService.searchShops(query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/verified")
    @Operation(summary = "Get verified shops")
    public ResponseEntity<ApiResponse<List<MedicineShopResponse>>> getVerifiedShops() {
        List<MedicineShopResponse> response = shopService.getVerifiedShops();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/my-shop")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current user's shop")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> getMyShop() {
        MedicineShopResponse response = shopService.getCurrentOwnerShop();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SHOP_OWNER') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a new shop")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> createShop(
            @Valid @RequestBody MedicineShopRequest request) {
        MedicineShopResponse response = shopService.createShop(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Shop created successfully"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SHOP_OWNER') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update a shop")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> updateShop(
            @PathVariable Long id,
            @Valid @RequestBody MedicineShopRequest request) {
        MedicineShopResponse response = shopService.updateShop(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Shop updated successfully"));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update shop status (Admin only)")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> updateShopStatus(
            @PathVariable Long id,
            @RequestParam ShopStatus status) {
        MedicineShopResponse response = shopService.updateShopStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(response, "Shop status updated successfully"));
    }
    
    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Verify a shop (Admin only)")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> verifyShop(@PathVariable Long id) {
        MedicineShopResponse response = shopService.verifyShop(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Shop verified successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Delete a shop (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteShop(@PathVariable Long id) {
        shopService.deleteShop(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Shop deleted successfully"));
    }
}
