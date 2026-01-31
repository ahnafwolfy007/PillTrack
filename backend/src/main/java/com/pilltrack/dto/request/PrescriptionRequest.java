package com.pilltrack.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionRequest {
    
    @Size(max = 500, message = "File URL must not exceed 500 characters")
    private String fileUrl;
    
    @Size(max = 50, message = "File type must not exceed 50 characters")
    private String fileType;
    
    @Size(max = 150, message = "Doctor name must not exceed 150 characters")
    private String doctorName;
    
    @Size(max = 100, message = "Hospital name must not exceed 100 characters")
    private String hospitalName;
    
    private LocalDate prescriptionDate;
    private LocalDate expiryDate;
    
    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;
}
