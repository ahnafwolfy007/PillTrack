package com.pilltrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicationModificationRequestDto {

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long medicationId; // Optional - for MODIFY/DELETE operations

    @NotBlank(message = "Request type is required")
    private String requestType; // ADD, MODIFY, DELETE

    private String message; // Doctor's message to patient

    private String proposedChanges; // JSON string of proposed medication changes
}
