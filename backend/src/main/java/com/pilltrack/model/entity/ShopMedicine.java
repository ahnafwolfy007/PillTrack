package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shop_medicines", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"shop_id", "medicine_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopMedicine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private MedicineShop shop;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicine_id", nullable = false)
    private Medicine medicine;
    
    // Pricing
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer discountPercent = 0;
    
    // Inventory
    @Column(nullable = false)
    @Builder.Default
    private Integer stockQuantity = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer minStockAlert = 10;
    
    @Column(length = 50)
    private String batchNumber;
    
    @Column
    private LocalDate expiryDate;
    
    @Column
    private LocalDate manufactureDate;
    
    // Status
    @Column(nullable = false)
    @Builder.Default
    private Boolean isAvailable = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFeatured = false;
    
    // Statistics
    @Column(nullable = false)
    @Builder.Default
    private Integer soldCount = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer viewCount = 0;
    
    // Timestamps
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public boolean isLowStock() {
        return this.stockQuantity <= this.minStockAlert;
    }
    
    public boolean isOutOfStock() {
        return this.stockQuantity <= 0;
    }
    
    public boolean isExpiringSoon() {
        if (this.expiryDate == null) return false;
        return this.expiryDate.isBefore(LocalDate.now().plusMonths(3));
    }
    
    public BigDecimal getEffectivePrice() {
        return this.discountPrice != null ? this.discountPrice : this.price;
    }
}
