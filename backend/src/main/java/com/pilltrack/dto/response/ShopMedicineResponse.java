package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopMedicineResponse {
    
    private Long id;
    
    // Shop info
    private Long shopId;
    private String shopName;
    private String shopSlug;
    private Double shopRating;
    private String shopCity;
    
    // Medicine info
    private Long medicineId;
    private String medicineBrandName;
    private String medicineGenericName;
    private String medicineSlug;
    private String medicineStrength;
    private String medicineForm;
    private String medicineImageUrl;
    private Boolean requiresPrescription;
    private String manufacturerName;
    private String categoryName;
    
    // Pricing
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer discountPercent;
    private BigDecimal effectivePrice;
    
    // Inventory
    private Integer stockQuantity;
    private Boolean isAvailable;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private LocalDate expiryDate;
    private Boolean isExpiringSoon;
    
    // Status
    private Boolean isFeatured;
    
    // Statistics
    private Integer soldCount;
    private Integer viewCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
