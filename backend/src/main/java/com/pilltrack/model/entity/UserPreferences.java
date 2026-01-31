package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@Table(name = "user_preferences")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreferences {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean emailNotifications = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean pushNotifications = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean medicationReminders = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean lowStockAlerts = true;
    
    @Column(nullable = false)
    @Builder.Default
    private Boolean orderUpdates = true;
    
    @Column(length = 50)
    @Builder.Default
    private String reminderSound = "default";
    
    @Column(length = 50)
    @Builder.Default
    private String timezone = "Asia/Dhaka";
    
    @Column(length = 10)
    @Builder.Default
    private String language = "en";
}
