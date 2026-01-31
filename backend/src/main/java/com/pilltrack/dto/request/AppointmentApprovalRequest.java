package com.pilltrack.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentApprovalRequest {

    private boolean approve;

    private LocalTime appointmentTime;

    private String doctorNotes;

    private String rejectionReason;
}
