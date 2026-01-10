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
@Table(name = "prescriptions")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prescription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    // Prescription Details
    @Column(length = 150)
    private String doctorName;
    
    @Column(length = 100)
    private String hospitalName;
    
    @Column
    private LocalDate prescriptionDate;
    
    @Column
    private LocalDate expiryDate;
    
    // File Information
    @Column(nullable = false, length = 500)
    private String fileUrl;
    
    @Column(length = 50)
    private String fileType;
    
    @Column
    private Long fileSize;
    
    @Column(length = 255)
    private String originalFileName;
    
    // Verification
    @Column(nullable = false)
    @Builder.Default
    private Boolean isVerified = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;
    
    @Column
    private LocalDateTime verifiedAt;
    
    @Column(columnDefinition = "TEXT")
    private String verificationNotes;
    
    // Status
    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    // Timestamps
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "prescription")
    @Builder.Default
    private List<Order> orders = new ArrayList<>();
    
    // Helper methods
    public boolean isExpired() {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now());
    }
    
    public void verify(User verifier, String notes) {
        this.isVerified = true;
        this.verifiedBy = verifier;
        this.verifiedAt = LocalDateTime.now();
        this.verificationNotes = notes;
    }
}
