package com.pilltrack.model.entity;

import com.pilltrack.model.enums.MedicationStatus;
import com.pilltrack.model.enums.MedicationType;
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
@Table(name = "medications")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medication {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false, length = 100)
    private String name;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private MedicationType type;
    
    @Column(nullable = false, length = 50)
    private String dosage;
    
    @Column(nullable = false)
    private Integer frequency; // doses per day
    
    @Column(nullable = false)
    @Builder.Default
    private Integer inventory = 0;
    
    @Column(nullable = false)
    private LocalDate startDate;
    
    @Column
    private LocalDate endDate;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    @Column(length = 100)
    private String prescribedBy;
    
    @Column
    private String imageUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private MedicationStatus status = MedicationStatus.ACTIVE;
    
    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DoseLog> doseLogs = new ArrayList<>();
    
    @OneToMany(mappedBy = "medication", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Reminder> reminders = new ArrayList<>();
    
    // Utility methods
    public boolean isLowStock(int thresholdDays) {
        int dailyUsage = frequency;
        int daysRemaining = dailyUsage > 0 ? inventory / dailyUsage : 0;
        return daysRemaining <= thresholdDays;
    }
    
    public int getDaysRemaining() {
        return frequency > 0 ? inventory / frequency : 0;
    }
}
