package com.pilltrack.dto.response;

import com.pilltrack.model.enums.ShopStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineShopResponse {
    
    private Long id;
    private String name;
    private String slug;
    private String description;
    
    // Owner
    private Long ownerId;
    private String ownerName;
    
    // Contact
    private String email;
    private String phone;
    private String alternatePhone;
    
    // Address
    private String address;
    private String city;
    private String area;
    private String postalCode;
    private String country;
    
    // Business
    private String licenseNumber;
    private String taxId;
    
    // Media
    private String logoUrl;
    private String bannerUrl;
    
    // Status
    private ShopStatus status;
    private Boolean isVerified;
    private Boolean isActive;
    
    // Statistics
    private Integer totalProducts;
    private Integer totalOrders;
    private Double rating;
    private Integer ratingCount;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
