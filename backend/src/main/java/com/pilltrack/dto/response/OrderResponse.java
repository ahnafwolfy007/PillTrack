package com.pilltrack.dto.response;

import com.pilltrack.model.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderResponse {
    
    private Long id;
    private String orderNumber;
    
    // User
    private Long userId;
    private String userName;
    private String userEmail;
    
    // Shop
    private Long shopId;
    private String shopName;
    
    // Status
    private OrderStatus status;
    
    // Pricing
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal shippingCost;
    private BigDecimal tax;
    private BigDecimal total;
    
    // Shipping
    private String shippingName;
    private String shippingPhone;
    private String shippingAddress;
    private String shippingCity;
    private String shippingArea;
    private String shippingPostalCode;
    
    // Prescription
    private Boolean requiresPrescription;
    private Boolean prescriptionVerified;
    private Long prescriptionId;
    
    // Notes
    private String customerNotes;
    private String shopNotes;
    private String cancellationReason;
    
    // Items
    private List<OrderItemResponse> items;
    
    // Payment
    private PaymentResponse payment;
    
    // Timestamps
    private LocalDateTime confirmedAt;
    private LocalDateTime processingAt;
    private LocalDateTime shippedAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime cancelledAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
