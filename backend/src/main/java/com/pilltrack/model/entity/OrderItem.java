package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_medicine_id", nullable = false)
    private ShopMedicine shopMedicine;
    
    // Snapshot of medicine details at time of order
    @Column(nullable = false, length = 150)
    private String medicineName;
    
    @Column(nullable = false, length = 50)
    private String medicineStrength;
    
    @Column(nullable = false, length = 50)
    private String medicineForm;
    
    @Column(length = 150)
    private String manufacturerName;
    
    // Quantity and pricing
    @Column(nullable = false)
    private Integer quantity;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal discountPrice;
    
    @Column(nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal lineTotal;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    // Helper methods
    public BigDecimal getEffectiveUnitPrice() {
        return discountPrice != null ? discountPrice : unitPrice;
    }
    
    public void calculateLineTotal() {
        this.lineTotal = getEffectiveUnitPrice().multiply(BigDecimal.valueOf(quantity));
    }
}
