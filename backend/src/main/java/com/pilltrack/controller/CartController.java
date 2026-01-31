package com.pilltrack.controller;

import com.pilltrack.dto.request.CartItemRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.CartResponse;
import com.pilltrack.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Cart", description = "Shopping cart management endpoints")
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<ApiResponse<CartResponse>> getCart() {
        CartResponse response = cartService.getCart();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping("/items")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<ApiResponse<CartResponse>> addToCart(@Valid @RequestBody CartItemRequest request) {
        CartResponse response = cartService.addToCart(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Item added to cart"));
    }
    
    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<ApiResponse<CartResponse>> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        CartResponse response = cartService.updateCartItem(itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success(response, "Cart item updated"));
    }
    
    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<ApiResponse<CartResponse>> removeFromCart(@PathVariable Long itemId) {
        CartResponse response = cartService.removeFromCart(itemId);
        return ResponseEntity.ok(ApiResponse.success(response, "Item removed from cart"));
    }
    
    @DeleteMapping("/clear")
    @Operation(summary = "Clear cart")
    public ResponseEntity<ApiResponse<Void>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared"));
    }
}
