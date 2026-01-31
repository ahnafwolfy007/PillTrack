package com.pilltrack.model.enums;

public enum AppointmentStatus {
    PENDING,       // Patient requested, waiting for doctor approval
    APPROVED,      // Doctor approved the appointment
    REJECTED,      // Doctor rejected the appointment
    CANCELLED,     // Either party cancelled
    COMPLETED,     // Appointment was completed
    NO_SHOW        // Patient didn't show up
}
