package com.pilltrack.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "specialties")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Specialty {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "name", nullable = false, length = 200, unique = true)
    private String name;
    
    @Column(name = "display_name", length = 200)
    private String displayName;
    
    @Column(name = "description", length = 500)
    private String description;
    
    @Column(name = "icon_name", length = 50)
    private String iconName;
    
    @Column(name = "slug", length = 200)
    private String slug;
    
    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
    
    @OneToMany(mappedBy = "specialty", fetch = FetchType.LAZY)
    @Builder.Default
    private List<Doctor> doctors = new ArrayList<>();
    
    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
