package com.pilltrack.dto.response;

import com.pilltrack.model.enums.ModificationRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationModificationRequestResponse {

    private Long id;
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorImageUrl;
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private Long medicationId;
    private String medicationName;
    private String requestType;
    private String message;
    private String proposedChanges;
    private ModificationRequestStatus status;
    private String patientResponseMessage;
    private LocalDateTime respondedAt;
    private LocalDateTime expiresAt;
    private LocalDateTime createdAt;
}
