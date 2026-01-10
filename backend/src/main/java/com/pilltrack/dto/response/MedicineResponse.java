package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineResponse {
    
    private Long id;
    
    // Basic Information
    private String brandName;
    private String genericName;
    private String slug;
    private String strength;
    private String form;
    private String composition;
    
    // Classification
    private MedicineCategoryResponse category;
    private String therapeuticClass;
    
    // Manufacturer
    private MedicineManufacturerResponse manufacturer;
    
    // Medical Information
    private String description;
    private String indications;
    private String dosageAdults;
    private String dosageChildren;
    private String dosageElderly;
    private String administration;
    
    // Safety Information
    private String sideEffects;
    private String contraindications;
    private String warnings;
    private String precautions;
    private String drugInteractions;
    private String foodInteractions;
    
    // Pregnancy & Lactation
    private String pregnancyCategory;
    private String pregnancyInfo;
    private String lactationInfo;
    
    // Overdose & Storage
    private String overdoseInfo;
    private String storageConditions;
    
    // Prescription Information
    private Boolean requiresPrescription;
    private String scheduleType;
    
    // Pharmacology
    private String pharmacology;
    private String pharmacokinetics;
    private String halfLife;
    private String onsetOfAction;
    private String durationOfAction;
    
    // Packaging Information
    private String packSizes;
    private String color;
    private String shape;
    private String imprint;
    
    // SEO & Search
    private String keywords;
    private String imageUrl;
    
    // Status & Metadata
    private Boolean isActive;
    private LocalDate approvalDate;
    private String approvalAuthority;
    private Integer viewCount;
    
    // Alternatives
    private List<MedicineAlternativeResponse> alternatives;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
