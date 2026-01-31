package com.pilltrack.controller;

import com.pilltrack.dto.request.OrderRequest;
import com.pilltrack.dto.request.OrderStatusUpdateRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.OrderResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.model.enums.OrderStatus;
import com.pilltrack.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Orders", description = "Order management endpoints")
public class OrderController {
    
    private final OrderService orderService;
    
    @GetMapping
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getMyOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getCurrentUserOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        OrderResponse response = orderService.getOrderById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/number/{orderNumber}")
    @Operation(summary = "Get order by order number")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderByNumber(@PathVariable String orderNumber) {
        OrderResponse response = orderService.getOrderByNumber(orderNumber);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderResponse> response = orderService.getCurrentUserOrdersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "Place a new order")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrder(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrder(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Order placed successfully"));
    }
    
    @PostMapping("/from-cart")
    @Operation(summary = "Place order from cart")
    public ResponseEntity<ApiResponse<OrderResponse>> placeOrderFromCart(@Valid @RequestBody OrderRequest request) {
        OrderResponse response = orderService.placeOrderFromCart(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Order placed successfully"));
    }
    
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an order")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        OrderResponse response = orderService.cancelOrder(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Order cancelled successfully"));
    }
    
    // Shop Owner Endpoints
    @GetMapping("/shop")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @Operation(summary = "Get orders for shop owner")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getShopOrders(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getShopOwnerOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/shop/status/{status}")
    @PreAuthorize("hasRole('SHOP_OWNER')")
    @Operation(summary = "Get shop orders by status")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getShopOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderResponse> response = orderService.getShopOrdersByStatus(status);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('SHOP_OWNER') or hasRole('ADMIN')")
    @Operation(summary = "Update order status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        OrderResponse response = orderService.updateOrderStatus(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Order status updated successfully"));
    }
    
    // Admin Endpoints
    @GetMapping("/admin/all")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all orders (Admin)")
    public ResponseEntity<ApiResponse<PageResponse<OrderResponse>>> getAllOrders(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<OrderResponse> response = orderService.getAllOrders(pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/admin/date-range")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get orders by date range (Admin)")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<OrderResponse> response = orderService.getOrdersByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
