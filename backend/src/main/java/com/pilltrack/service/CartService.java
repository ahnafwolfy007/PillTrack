package com.pilltrack.service;

import com.pilltrack.dto.request.CartItemRequest;
import com.pilltrack.dto.response.CartItemResponse;
import com.pilltrack.dto.response.CartResponse;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Cart;
import com.pilltrack.model.entity.CartItem;
import com.pilltrack.model.entity.ShopMedicine;
import com.pilltrack.model.entity.User;
import com.pilltrack.repository.CartItemRepository;
import com.pilltrack.repository.CartRepository;
import com.pilltrack.repository.ShopMedicineRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {
    
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ShopMedicineRepository shopMedicineRepository;
    private final CurrentUser currentUser;
    
    @Transactional(readOnly = true)
    public CartResponse getCart() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Cart cart = getOrCreateCart(user);
        return mapToResponse(cart);
    }
    
    @Transactional
    public CartResponse addToCart(CartItemRequest request) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        ShopMedicine shopMedicine = shopMedicineRepository.findById(request.getShopMedicineId())
                .orElseThrow(() -> new ResourceNotFoundException("ShopMedicine", "id", request.getShopMedicineId()));
        
        if (!shopMedicine.getIsAvailable() || shopMedicine.isOutOfStock()) {
            throw new BadRequestException("This product is currently unavailable");
        }
        
        if (shopMedicine.getStockQuantity() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity exceeds available stock");
        }
        
        Cart cart = getOrCreateCart(user);
        
        // Check if item already exists in cart
        CartItem existingItem = cartItemRepository
                .findByCartIdAndShopMedicineId(cart.getId(), shopMedicine.getId())
                .orElse(null);
        
        if (existingItem != null) {
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (newQuantity > shopMedicine.getStockQuantity()) {
                throw new BadRequestException("Total quantity exceeds available stock");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .shopMedicine(shopMedicine)
                    .quantity(request.getQuantity())
                    .price(shopMedicine.getPrice())
                    .discountPrice(shopMedicine.getDiscountPrice())
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }
        
        cart.recalculateTotals();
        cart = cartRepository.save(cart);
        
        log.info("Added to cart: {} x{} for user {}", 
                shopMedicine.getMedicine().getBrandName(), request.getQuantity(), user.getEmail());
        
        return mapToResponse(cart);
    }
    
    @Transactional
    public CartResponse updateCartItem(Long itemId, int quantity) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Cart cart = getOrCreateCart(user);
        
        CartItem cartItem = cart.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", itemId));
        
        if (quantity <= 0) {
            cart.removeItem(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            if (quantity > cartItem.getShopMedicine().getStockQuantity()) {
                throw new BadRequestException("Quantity exceeds available stock");
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
            cart.recalculateTotals();
        }
        
        cart = cartRepository.save(cart);
        
        log.info("Updated cart item {} to quantity {} for user {}", itemId, quantity, user.getEmail());
        
        return mapToResponse(cart);
    }
    
    @Transactional
    public CartResponse removeFromCart(Long itemId) {
        return updateCartItem(itemId, 0);
    }
    
    @Transactional
    public CartResponse clearCart() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Cart cart = getOrCreateCart(user);
        
        cartItemRepository.deleteAllByCartId(cart.getId());
        cart.clearCart();
        cart = cartRepository.save(cart);
        
        log.info("Cart cleared for user {}", user.getEmail());
        
        return mapToResponse(cart);
    }
    
    private Cart getOrCreateCart(User user) {
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
    
    private CartResponse mapToResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(this::mapItemToResponse)
                .collect(Collectors.toList());
        
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .totalItems(cart.getTotalItems())
                .subtotal(cart.getSubtotal())
                .discount(cart.getDiscount())
                .total(cart.getTotal())
                .items(items)
                .createdAt(cart.getCreatedAt())
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
    
    private CartItemResponse mapItemToResponse(CartItem item) {
        ShopMedicine sm = item.getShopMedicine();
        return CartItemResponse.builder()
                .id(item.getId())
                .shopMedicineId(sm.getId())
                .shopId(sm.getShop().getId())
                .shopName(sm.getShop().getName())
                .medicineId(sm.getMedicine().getId())
                .medicineName(sm.getMedicine().getBrandName())
                .medicineGenericName(sm.getMedicine().getGenericName())
                .medicineStrength(sm.getMedicine().getStrength())
                .medicineForm(sm.getMedicine().getDosageForm())
                .medicineImageUrl(null)
                .requiresPrescription(false)
                .quantity(item.getQuantity())
                .price(item.getPrice())
                .discountPrice(item.getDiscountPrice())
                .effectivePrice(item.getEffectivePrice())
                .lineTotal(item.getLineTotal())
                .availableStock(sm.getStockQuantity())
                .isAvailable(sm.getIsAvailable() && !sm.isOutOfStock())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
