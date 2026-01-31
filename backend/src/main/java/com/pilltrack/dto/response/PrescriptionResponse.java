package com.pilltrack.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionResponse {
    
    private Long id;
    private Long userId;
    private String userName;
    private String doctorName;
    private String hospitalName;
    private LocalDate prescriptionDate;
    private LocalDate expiryDate;
    private String fileUrl;
    private String fileType;
    private Long fileSize;
    private String originalFileName;
    private Boolean isVerified;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private String verificationNotes;
    private Boolean isActive;
    private Boolean isExpired;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
