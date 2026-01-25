package com.pilltrack.dto.response;

import com.pilltrack.model.enums.AppointmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    private Long id;

    // Doctor info
    private Long doctorId;
    private String doctorName;
    private String doctorSpecialty;
    private String doctorImageUrl;
    private Double doctorRating;
    private String doctorChamber;
    private String doctorPhone;

    // Patient info
    private Long patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    // Appointment details
    private LocalDate appointmentDate;
    private LocalTime appointmentTime;
    private Integer serialNumber;
    private AppointmentStatus status;
    private String symptoms;
    private String patientNotes;
    private String doctorNotes;
    private String rejectionReason;
    private Double consultationFee;
    private Boolean isFirstVisit;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;
}
