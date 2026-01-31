package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cart_items")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_medicine_id", nullable = false)
    private ShopMedicine shopMedicine;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer quantity = 1;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public BigDecimal getEffectivePrice() {
        return discountPrice != null ? discountPrice : price;
    }
    
    public BigDecimal getLineTotal() {
        return getEffectivePrice().multiply(BigDecimal.valueOf(quantity));
    }
    
    public void updateQuantity(int newQuantity) {
        this.quantity = newQuantity;
        if (cart != null) {
            cart.recalculateTotals();
        }
    }
}
