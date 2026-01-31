package com.pilltrack.model.entity;

import com.pilltrack.model.enums.OrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String orderNumber;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shop_id", nullable = false)
    private MedicineShop shop;
    
    // Order Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING;
    
    // Pricing
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingCost = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal tax = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal total;
    
    // Shipping Address
    @Column(nullable = false, length = 100)
    private String shippingName;
    
    @Column(nullable = false, length = 20)
    private String shippingPhone;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String shippingAddress;
    
    @Column(nullable = false, length = 100)
    private String shippingCity;
    
    @Column(length = 100)
    private String shippingArea;
    
    @Column(length = 20)
    private String shippingPostalCode;
    
    // Prescription
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id")
    private Prescription prescription;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean requiresPrescription = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean prescriptionVerified = false;
    
    // Notes
    @Column(columnDefinition = "TEXT")
    private String customerNotes;
    
    @Column(columnDefinition = "TEXT")
    private String shopNotes;
    
    @Column(columnDefinition = "TEXT")
    private String cancellationReason;
    
    // Timestamps
    @Column
    private LocalDateTime confirmedAt;
    
    @Column
    private LocalDateTime processingAt;
    
    @Column
    private LocalDateTime shippedAt;
    
    @Column
    private LocalDateTime deliveredAt;
    
    @Column
    private LocalDateTime cancelledAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();
    
    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL)
    private Payment payment;
    
    // Helper methods
    @PrePersist
    public void generateOrderNumber() {
        if (this.orderNumber == null) {
            this.orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
    }
    
    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }
    
    public void removeItem(OrderItem item) {
        items.remove(item);
        item.setOrder(null);
    }
    
    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
        LocalDateTime now = LocalDateTime.now();
        
        switch (newStatus) {
            case CONFIRMED -> this.confirmedAt = now;
            case PROCESSING -> this.processingAt = now;
            case SHIPPED -> this.shippedAt = now;
            case DELIVERED -> this.deliveredAt = now;
            case CANCELLED -> this.cancelledAt = now;
            default -> {}
        }
    }
}
