package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyLocationResponse {
    
    private Long id;
    private String name;
    private String slug;
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
    private Integer totalProducts;
    private Boolean isOpen;
}
