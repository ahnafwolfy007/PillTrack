package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacySearchResponse {
    
    // Pharmacy details
    private Long pharmacyId;
    private String pharmacyName;
    private String pharmacySlug;
    private String address;
    private String area;
    private String ward;
    private String city;
    private String phone;
    private Double latitude;
    private Double longitude;
    private Double rating;
    private Integer ratingCount;
    private String logoUrl;
    
    // Medicine details
    private Long medicineId;
    private String medicineName;
    private String genericName;
    private String dosageForm;
    private String strength;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private Integer stockQuantity;
    private Boolean isAvailable;
    
    // Distance from user
    private Double distanceKm;
    private String distanceFormatted;
}
