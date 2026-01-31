package com.pilltrack.controller;

import com.pilltrack.dto.request.AppointmentApprovalRequest;
import com.pilltrack.dto.request.AppointmentRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.AppointmentResponse;
import com.pilltrack.service.AppointmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/appointments")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Appointments", description = "Appointment booking and management APIs")
public class AppointmentController {

    private final AppointmentService appointmentService;

    // ==================== Patient Endpoints ====================

    @PostMapping
    @Operation(summary = "Book an appointment with a doctor")
    public ResponseEntity<ApiResponse<AppointmentResponse>> bookAppointment(
            @Valid @RequestBody AppointmentRequest request) {
        AppointmentResponse response = appointmentService.bookAppointment(request);
        return ResponseEntity.status(201).body(ApiResponse.created(response, "Appointment request sent successfully"));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all appointments for current patient")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getPatientAppointments()));
    }

    @GetMapping("/my/upcoming")
    @Operation(summary = "Get upcoming appointments for current patient")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getMyUpcomingAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getPatientUpcomingAppointments()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get appointment by ID")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getAppointmentById(id)));
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an appointment")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.cancelAppointment(id, reason), "Appointment cancelled"));
    }

    // ==================== Doctor Endpoints ====================

    @GetMapping("/doctor")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get all appointments for current doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorAppointments()));
    }

    @GetMapping("/doctor/pending")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get pending appointment requests for current doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorPendingAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorPendingAppointments()));
    }

    @GetMapping("/doctor/upcoming")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Get upcoming approved appointments for current doctor")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getDoctorUpcomingAppointments() {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.getDoctorUpcomingAppointments()));
    }

    @PostMapping("/{id}/respond")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Approve or reject an appointment request")
    public ResponseEntity<ApiResponse<AppointmentResponse>> respondToAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentApprovalRequest request) {
        AppointmentResponse response = appointmentService.respondToAppointment(id, request);
        String message = request.isApprove() ? "Appointment approved" : "Appointment rejected";
        return ResponseEntity.ok(ApiResponse.success(response, message));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasRole('DOCTOR')")
    @Operation(summary = "Mark an appointment as completed")
    public ResponseEntity<ApiResponse<AppointmentResponse>> completeAppointment(
            @PathVariable Long id,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(ApiResponse.success(appointmentService.completeAppointment(id, notes), "Appointment completed"));
    }
}
