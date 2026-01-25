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
public class DoctorPatientResponse {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorImageUrl;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;
    private String status;
    private Boolean canModifyMedication;
    private String notes;
    private LocalDateTime createdAt;
}
