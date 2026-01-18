package com.pilltrack.model.entity;

import com.pilltrack.model.enums.ShopStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicine_shops")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineShop {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 150)
    private String name;
    
    @Column(unique = true, length = 150)
    private String slug;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    // Owner Information
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;
    
    // Contact Information
    @Column(nullable = false, length = 100)
    private String email;
    
    @Column(nullable = false, length = 20)
    private String phone;
    
    @Column(length = 20)
    private String alternatePhone;
    
    // Address Information
    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;
    
    @Column(nullable = false, length = 100)
    private String city;
    
    @Column(length = 100)
    private String area;
    
    @Column(length = 100)
    private String ward;
    
    @Column(length = 20)
    private String postalCode;
    
    // Geolocation for pharmacy finder
    @Column
    private Double latitude;
    
    @Column
    private Double longitude;
    
    @Column(nullable = false, length = 100)
    @Builder.Default
    private String country = "Bangladesh";
    
    // Business Information
    @Column(unique = true, length = 50)
    private String licenseNumber;
    
    @Column(length = 50)
    private String taxId;
    
    // Media
    @Column(length = 500)
    private String logoUrl;
    
    @Column(length = 500)
    private String bannerUrl;
    
    // Status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ShopStatus status = ShopStatus.PENDING;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    // Statistics
    @Column(nullable = false)
    @Builder.Default
    private Integer totalProducts = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer totalOrders = 0;
    
    @Column(nullable = false)
    @Builder.Default
    private Double rating = 0.0;
    
    @Column(nullable = false)
    @Builder.Default
    private Integer ratingCount = 0;
    
    // Timestamps
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL)
    @Builder.Default
    private List<ShopMedicine> shopMedicines = new ArrayList<>();
    
    @OneToMany(mappedBy = "shop", cascade = CascadeType.ALL)
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
}
