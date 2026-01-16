package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
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
    
    // Matches CSV: brand id
    @Column(name = "brand_id")
    private Integer brandId;
    
    // Matches CSV: brand name
    @Column(name = "brand_name", nullable = false, length = 200)
    private String brandName;
    
    // Matches CSV: type (allopathic, herbal, etc.)
    @Column(name = "type", length = 50)
    private String type;
    
    // Matches CSV: slug
    @Column(name = "slug", length = 255)
    private String slug;
    
    // Matches CSV: dosage form
    @Column(name = "dosage_form", length = 100)
    private String dosageForm;
    
    // Matches CSV: generic
    @Column(name = "generic_name", length = 500)
    private String genericName;
    
    // Matches CSV: strength
    @Column(name = "strength", length = 100)
    private String strength;
    
    // Manufacturer relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manufacturer_id")
    private MedicineManufacturer manufacturer;
    
    // Matches CSV: unit_quantity
    @Column(name = "unit_quantity", length = 100)
    private String unitQuantity;
    
    // Matches CSV: container_type
    @Column(name = "container_type", length = 100)
    private String containerType;
    
    // Matches CSV: unit_price
    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;
    
    // Matches CSV: pack_quantity
    @Column(name = "pack_quantity", precision = 10, scale = 2)
    private BigDecimal packQuantity;
    
    // Matches CSV: pack_price
    @Column(name = "pack_price", precision = 12, scale = 2)
    private BigDecimal packPrice;
    
    // Status field
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    // View count for popularity
    @Column(name = "view_count")
    @Builder.Default
    private Integer viewCount = 0;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "medicine", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShopMedicine> shopMedicines = new ArrayList<>();
}
