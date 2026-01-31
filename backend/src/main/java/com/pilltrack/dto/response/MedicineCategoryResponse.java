package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicineCategoryResponse {
    
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String iconName;
    private Boolean isActive;
    private Long medicineCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
