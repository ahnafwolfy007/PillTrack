package com.pilltrack.controller;

import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.dto.response.UserResponse;
import com.pilltrack.dto.response.MedicineShopResponse;
import com.pilltrack.dto.response.OrderResponse;
import com.pilltrack.model.enums.OrderStatus;
import com.pilltrack.model.enums.ShopStatus;
import com.pilltrack.service.MedicineShopService;
import com.pilltrack.service.OrderService;
import com.pilltrack.service.UserService;
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

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Admin", description = "Admin management endpoints")
public class AdminController {
    
    private final UserService userService;
    private final MedicineShopService shopService;
    private final OrderService orderService;
    
    @GetMapping("/dashboard/stats")
    @Operation(summary = "Get admin dashboard statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        
        stats.put("totalUsers", userService.getTotalUserCount());
        stats.put("totalShops", shopService.getTotalShopCount());
        stats.put("pendingShops", shopService.getShopCountByStatus(ShopStatus.PENDING));
        stats.put("totalOrders", orderService.getTotalOrderCount());
        stats.put("pendingOrders", orderService.getOrderCountByStatus(OrderStatus.PENDING));
        stats.put("totalRevenue", orderService.getTotalRevenue());
        
        return ResponseEntity.ok(ApiResponse.success(stats));
    }
    
    @GetMapping("/users")
    @Operation(summary = "Get all users with pagination")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getAllUsers(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<UserResponse> response = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/users/{id}/activate")
    @Operation(summary = "Activate a user")
    public ResponseEntity<ApiResponse<Void>> activateUser(@PathVariable Long id) {
        userService.activateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User activated successfully"));
    }
    
    @PostMapping("/users/{id}/deactivate")
    @Operation(summary = "Deactivate a user")
    public ResponseEntity<ApiResponse<Void>> deactivateUser(@PathVariable Long id) {
        userService.deactivateUser(id);
        return ResponseEntity.ok(ApiResponse.success(null, "User deactivated successfully"));
    }
    
    @GetMapping("/shops")
    @Operation(summary = "Get all shops with pagination")
    public ResponseEntity<ApiResponse<PageResponse<MedicineShopResponse>>> getAllShops(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<MedicineShopResponse> response = shopService.getAllShops(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/shops/pending")
    @Operation(summary = "Get pending shops for approval")
    public ResponseEntity<ApiResponse<PageResponse<MedicineShopResponse>>> getPendingShops(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<MedicineShopResponse> response = shopService.getShopsByStatus(ShopStatus.PENDING, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/shops/{id}/approve")
    @Operation(summary = "Approve a shop")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> approveShop(@PathVariable Long id) {
        MedicineShopResponse response = shopService.updateShopStatus(id, ShopStatus.VERIFIED);
        return ResponseEntity.ok(ApiResponse.success(response, "Shop approved successfully"));
    }
    
    @PostMapping("/shops/{id}/reject")
    @Operation(summary = "Reject a shop")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> rejectShop(@PathVariable Long id) {
        MedicineShopResponse response = shopService.updateShopStatus(id, ShopStatus.SUSPENDED);
        return ResponseEntity.ok(ApiResponse.success(response, "Shop rejected"));
    }
    
    @PostMapping("/shops/{id}/verify")
    @Operation(summary = "Verify a shop")
    public ResponseEntity<ApiResponse<MedicineShopResponse>> verifyShop(@PathVariable Long id) {
        MedicineShopResponse response = shopService.verifyShop(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Shop verified successfully"));
    }
    
    @GetMapping("/orders")
    @Operation(summary = "Get all orders with pagination")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/orders/status/{status}")
    @Operation(summary = "Get orders by status")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getOrdersByStatus(
            @PathVariable OrderStatus status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getOrdersByStatus(status, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
