package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicines")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicine {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Basic Information
    @Column(nullable = false, length = 150)
    private String brandName;
    
    @Column(nullable = false, length = 150)
    private String genericName;
    
    @Column(unique = true, length = 200)
    private String slug;
    
    // Composition
    @Column(length = 50)
    private String strength;
    
    @Column(length = 50)
    private String form;
    
    @Column(columnDefinition = "TEXT")
    private String composition;
    
    // Classification
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private MedicineCategory category;
    
    @Column(length = 100)
    private String therapeuticClass;
    
    // Manufacturer
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private MedicineManufacturer manufacturer;
    
    // Medical Information
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String indications;
    
    @Column(columnDefinition = "TEXT")
    private String dosageAdults;
    
    @Column(columnDefinition = "TEXT")
    private String dosageChildren;
    
    @Column(columnDefinition = "TEXT")
    private String dosageElderly;
    
    @Column(columnDefinition = "TEXT")
    private String administration;
    
    // Safety Information
    @Column(columnDefinition = "TEXT")
    private String sideEffects;
    
    @Column(columnDefinition = "TEXT")
    private String contraindications;
    
    @Column(columnDefinition = "TEXT")
    private String warnings;
    
    @Column(columnDefinition = "TEXT")
    private String precautions;
    
    @Column(columnDefinition = "TEXT")
    private String drugInteractions;
    
    @Column(columnDefinition = "TEXT")
    private String foodInteractions;
    
    // Pregnancy & Lactation
    @Column(length = 5)
    private String pregnancyCategory;
    
    @Column(columnDefinition = "TEXT")
    private String pregnancyInfo;
    
    @Column(columnDefinition = "TEXT")
    private String lactationInfo;
    
    // Overdose & Storage
    @Column(columnDefinition = "TEXT")
    private String overdoseInfo;
    
    @Column(columnDefinition = "TEXT")
    private String storageConditions;
    
    // Prescription Information
    @Column
    @Builder.Default
    private Boolean requiresPrescription = false;
    
    @Column(length = 20)
    private String scheduleType;
    
    // Pharmacology
    @Column(columnDefinition = "TEXT")
    private String pharmacology;
    
    @Column(columnDefinition = "TEXT")
    private String pharmacokinetics;
    
    @Column(length = 50)
    private String halfLife;
    
    @Column(length = 50)
    private String onsetOfAction;
    
    @Column(length = 50)
    private String durationOfAction;
    
    // Packaging Information
    @Column(length = 100)
    private String packSizes;
    
    @Column(length = 50)
    private String color;
    
    @Column(length = 50)
    private String shape;
    
    @Column(length = 50)
    private String imprint;
    
    // SEO & Search
    @Column(columnDefinition = "TEXT")
    private String keywords;
    
    @Column(length = 500)
    private String imageUrl;
    
    // Status & Metadata
    @Column
    @Builder.Default
    private Boolean isActive = true;
    
    @Column
    private LocalDate approvalDate;
    
    @Column(length = 100)
    private String approvalAuthority;
    
    @Column
    @Builder.Default
    private Integer viewCount = 0;
    
    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "medicine", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShopMedicine> shopMedicines = new ArrayList<>();
}
