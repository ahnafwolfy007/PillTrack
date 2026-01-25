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
public class PatientSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String city;
    private String avatarUrl;
    private Boolean isActive;
    private LocalDateTime assignedAt;
    private Boolean canModifyMedication;
}
