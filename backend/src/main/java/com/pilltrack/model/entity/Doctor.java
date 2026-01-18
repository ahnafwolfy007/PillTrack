package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "doctors")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Doctor {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 300)
    private String name;
    
    @Column(name = "education", length = 500)
    private String education;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "specialty_id")
    private Specialty specialty;
    
    @Column(name = "specialty_raw", length = 300)
    private String specialtyRaw;
    
    @Column(name = "experience_years")
    private Integer experienceYears;
    
    @Column(name = "chamber", length = 500)
    private String chamber;
    
    @Column(name = "location", length = 300)
    private String location;
    
    @Column(name = "concentrations", columnDefinition = "TEXT")
    private String concentrations;
    
    @Column(name = "phone", length = 50)
    private String phone;
    
    @Column(name = "email", length = 200)
    private String email;
    
    @Column(name = "image_url", length = 500)
    private String imageUrl;
    
    @Column(name = "consultation_fee")
    private Double consultationFee;
    
    @Column(name = "rating")
    @Builder.Default
    private Double rating = 4.0;
    
    @Column(name = "rating_count")
    @Builder.Default
    private Integer ratingCount = 0;
    
    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
