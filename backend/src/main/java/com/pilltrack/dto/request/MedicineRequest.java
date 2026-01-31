package com.pilltrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineRequest {
    
    // Basic Information
    @NotBlank(message = "Brand name is required")
    @Size(max = 150, message = "Brand name must not exceed 150 characters")
    private String brandName;
    
    @NotBlank(message = "Generic name is required")
    @Size(max = 150, message = "Generic name must not exceed 150 characters")
    private String genericName;
    
    @NotBlank(message = "Strength is required")
    @Size(max = 50, message = "Strength must not exceed 50 characters")
    private String strength;
    
    @NotBlank(message = "Form is required")
    @Size(max = 50, message = "Form must not exceed 50 characters")
    private String form;
    
    private String composition;
    
    // Classification
    private Long categoryId;
    
    @Size(max = 100, message = "Therapeutic class must not exceed 100 characters")
    private String therapeuticClass;
    
    // Manufacturer
    private Long manufacturerId;
    
    // Medical Information
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotBlank(message = "Indications are required")
    private String indications;
    
    @NotBlank(message = "Adult dosage is required")
    private String dosageAdults;
    
    private String dosageChildren;
    private String dosageElderly;
    
    @NotBlank(message = "Administration instructions are required")
    private String administration;
    
    // Safety Information
    @NotBlank(message = "Side effects are required")
    private String sideEffects;
    
    @NotBlank(message = "Contraindications are required")
    private String contraindications;
    
    private String warnings;
    private String precautions;
    private String drugInteractions;
    private String foodInteractions;
    
    // Pregnancy & Lactation
    @Size(max = 5, message = "Pregnancy category must not exceed 5 characters")
    private String pregnancyCategory;
    private String pregnancyInfo;
    private String lactationInfo;
    
    // Overdose & Storage
    private String overdoseInfo;
    
    @NotBlank(message = "Storage conditions are required")
    private String storageConditions;
    
    // Prescription Information
    private Boolean requiresPrescription;
    
    @Size(max = 20, message = "Schedule type must not exceed 20 characters")
    private String scheduleType;
    
    // Pharmacology
    private String pharmacology;
    private String pharmacokinetics;
    
    @Size(max = 50, message = "Half life must not exceed 50 characters")
    private String halfLife;
    
    @Size(max = 50, message = "Onset of action must not exceed 50 characters")
    private String onsetOfAction;
    
    @Size(max = 50, message = "Duration of action must not exceed 50 characters")
    private String durationOfAction;
    
    // Packaging Information
    @Size(max = 100, message = "Pack sizes must not exceed 100 characters")
    private String packSizes;
    
    @Size(max = 50, message = "Color must not exceed 50 characters")
    private String color;
    
    @Size(max = 50, message = "Shape must not exceed 50 characters")
    private String shape;
    
    @Size(max = 50, message = "Imprint must not exceed 50 characters")
    private String imprint;
    
    // SEO & Search
    private String keywords;
    
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;
    
    // Status & Metadata
    private Boolean isActive;
    private LocalDate approvalDate;
    
    @Size(max = 100, message = "Approval authority must not exceed 100 characters")
    private String approvalAuthority;
}
