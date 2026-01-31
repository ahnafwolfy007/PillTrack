package com.pilltrack.controller;

import com.pilltrack.dto.request.ShopMedicineRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.dto.response.ShopMedicineResponse;
import com.pilltrack.service.ShopMedicineService;
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
@RequestMapping("/api/v1/shop-medicines")
@RequiredArgsConstructor
@Tag(name = "Shop Medicines", description = "Shop inventory management endpoints")
public class ShopMedicineController {
    
    private final ShopMedicineService shopMedicineService;
    
    @GetMapping("/shop/{shopId}")
    @Operation(summary = "Get all medicines for a shop")
    public ResponseEntity<ApiResponse<PageResponse<ShopMedicineResponse>>> getShopMedicines(
            @PathVariable Long shopId,
            @PageableDefault(size = 20, sort = "medicine.name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<ShopMedicineResponse> response = shopMedicineService.getShopMedicines(shopId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get shop medicine by ID")
    public ResponseEntity<ApiResponse<ShopMedicineResponse>> getShopMedicineById(@PathVariable Long id) {
        ShopMedicineResponse response = shopMedicineService.getShopMedicineById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/medicine/{medicineId}")
    @Operation(summary = "Get all shops selling a medicine")
    public ResponseEntity<ApiResponse<List<ShopMedicineResponse>>> getShopsByMedicine(@PathVariable Long medicineId) {
        List<ShopMedicineResponse> response = shopMedicineService.getShopsByMedicine(medicineId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/shop/{shopId}/search")
    @Operation(summary = "Search medicines in a shop")
    public ResponseEntity<ApiResponse<PageResponse<ShopMedicineResponse>>> searchShopMedicines(
            @PathVariable Long shopId,
            @RequestParam String query,
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ShopMedicineResponse> response = shopMedicineService.searchShopMedicines(shopId, query, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/in-stock")
    @Operation(summary = "Get all in-stock medicines across shops")
    public ResponseEntity<ApiResponse<PageResponse<ShopMedicineResponse>>> getInStockMedicines(
            @PageableDefault(size = 20) Pageable pageable) {
        PageResponse<ShopMedicineResponse> response = shopMedicineService.getInStockMedicines(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/my-inventory")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current shop owner's inventory")
    public ResponseEntity<ApiResponse<PageResponse<ShopMedicineResponse>>> getMyInventory(
            @PageableDefault(size = 20, sort = "medicine.name", direction = Sort.Direction.ASC) Pageable pageable) {
        PageResponse<ShopMedicineResponse> response = shopMedicineService.getCurrentOwnerInventory(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Add medicine to shop inventory")
    public ResponseEntity<ApiResponse<ShopMedicineResponse>> addMedicineToShop(
            @Valid @RequestBody ShopMedicineRequest request) {
        ShopMedicineResponse response = shopMedicineService.addMedicineToShop(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Medicine added to inventory"));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update shop medicine")
    public ResponseEntity<ApiResponse<ShopMedicineResponse>> updateShopMedicine(
            @PathVariable Long id,
            @Valid @RequestBody ShopMedicineRequest request) {
        ShopMedicineResponse response = shopMedicineService.updateShopMedicine(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Medicine updated successfully"));
    }
    
    @PatchMapping("/{id}/stock")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update stock quantity")
    public ResponseEntity<ApiResponse<ShopMedicineResponse>> updateStock(
            @PathVariable Long id,
            @RequestParam int quantity) {
        ShopMedicineResponse response = shopMedicineService.updateStock(id, quantity);
        return ResponseEntity.ok(ApiResponse.success(response, "Stock updated successfully"));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SHOP_OWNER') or hasRole('ADMIN')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Remove medicine from shop inventory")
    public ResponseEntity<ApiResponse<Void>> removeMedicineFromShop(@PathVariable Long id) {
        shopMedicineService.removeMedicineFromShop(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Medicine removed from inventory"));
    }
}
