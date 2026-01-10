package com.pilltrack.model.entity;

import com.pilltrack.model.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;
    
    // Payment Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;
    
    // Amount
    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
    
    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "BDT";
    
    // Payment Method
    @Column(nullable = false, length = 50)
    private String paymentMethod;
    
    // SSLCommerz Transaction Details
    @Column(unique = true, length = 100)
    private String transactionId;
    
    @Column(length = 100)
    private String validationId;
    
    @Column(length = 100)
    private String bankTransactionId;
    
    @Column(length = 50)
    private String cardType;
    
    @Column(length = 50)
    private String cardBrand;
    
    @Column(length = 20)
    private String cardIssuer;
    
    @Column(length = 100)
    private String cardIssuerCountry;
    
    @Column(length = 50)
    private String riskLevel;
    
    @Column(length = 20)
    private String riskTitle;
    
    // Store amount after gateway charges
    @Column(precision = 12, scale = 2)
    private BigDecimal storeAmount;
    
    // Gateway response
    @Column(columnDefinition = "TEXT")
    private String gatewayResponse;
    
    @Column(columnDefinition = "TEXT")
    private String failureReason;
    
    // Refund details
    @Column(precision = 12, scale = 2)
    private BigDecimal refundAmount;
    
    @Column(length = 100)
    private String refundTransactionId;
    
    @Column
    private LocalDateTime refundedAt;
    
    @Column(columnDefinition = "TEXT")
    private String refundReason;
    
    // Timestamps
    @Column
    private LocalDateTime paidAt;
    
    @Column
    private LocalDateTime failedAt;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Helper methods
    public void markAsPaid(String transactionId, String validationId) {
        this.status = PaymentStatus.SUCCESS;
        this.transactionId = transactionId;
        this.validationId = validationId;
        this.paidAt = LocalDateTime.now();
    }
    
    public void markAsFailed(String reason) {
        this.status = PaymentStatus.FAILED;
        this.failureReason = reason;
        this.failedAt = LocalDateTime.now();
    }
    
    public void markAsRefunded(BigDecimal amount, String refundTxnId, String reason) {
        this.status = PaymentStatus.REFUNDED;
        this.refundAmount = amount;
        this.refundTransactionId = refundTxnId;
        this.refundReason = reason;
        this.refundedAt = LocalDateTime.now();
    }
}
