package com.pilltrack.controller;

import com.pilltrack.dto.request.DoctorProfileRequest;
import com.pilltrack.dto.request.MedicationModificationRequestDto;
import com.pilltrack.dto.request.MedicationRequest;
import com.pilltrack.dto.request.ModificationResponseDto;
import com.pilltrack.dto.response.*;
import com.pilltrack.security.CurrentUser;
import com.pilltrack.service.DoctorPatientService;
import com.pilltrack.service.DoctorService;
import com.pilltrack.service.DoseLogService;
import com.pilltrack.service.MedicationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/doctors")
@RequiredArgsConstructor
@Tag(name = "Doctor", description = "Doctor management APIs")
public class DoctorController {
    
    private final DoctorService doctorService;
    private final DoctorPatientService doctorPatientService;
    private final MedicationService medicationService;
    private final DoseLogService doseLogService;
    private final CurrentUser currentUser;
    
    @GetMapping
    @Operation(summary = "Get all doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getAllDoctors() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllDoctors()));
    }
    
    @GetMapping("/{id}")
    @Operation(summary = "Get doctor by ID")
    public ResponseEntity<ApiResponse<DoctorResponse>> getDoctorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorById(id)));
    }
    
    @GetMapping("/search")
    @Operation(summary = "Search doctors by name, specialty, or concentration")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> searchDoctors(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchDoctors(query)));
    }
    
    @GetMapping("/specialty/{specialtyId}")
    @Operation(summary = "Get doctors by specialty ID")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsBySpecialty(@PathVariable Long specialtyId) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialty(specialtyId)));
    }
    
    @GetMapping("/top-rated")
    @Operation(summary = "Get top rated doctors")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getTopRatedDoctors(
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getTopRatedDoctors(limit)));
    }
    
    @GetMapping("/locations")
    @Operation(summary = "Get all available locations")
    public ResponseEntity<ApiResponse<List<String>>> getAllLocations() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllLocations()));
    }
    
    @GetMapping("/location/{location}")
    @Operation(summary = "Get doctors by location")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsByLocation(@PathVariable String location) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsByLocation(location)));
    }
    
    @GetMapping("/specialties")
    @Operation(summary = "Get all specialties from Specialty table")
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> getAllSpecialties() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllSpecialties()));
    }
    
    @GetMapping("/specialties/search")
    @Operation(summary = "Search specialties from Specialty table")
    public ResponseEntity<ApiResponse<List<SpecialtyResponse>>> searchSpecialties(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchSpecialties(query)));
    }
    
    @GetMapping("/raw-specialties")
    @Operation(summary = "Get all unique specialties directly from doctor records with counts")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAllRawSpecialties() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getAllRawSpecialties()));
    }
    
    @GetMapping("/raw-specialties/search")
    @Operation(summary = "Search specialties from doctor records")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> searchRawSpecialties(@RequestParam String query) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.searchRawSpecialties(query)));
    }
    
    @GetMapping("/by-specialty-name/{specialtyName}")
    @Operation(summary = "Get doctors by specialty name (raw)")
    public ResponseEntity<ApiResponse<List<DoctorResponse>>> getDoctorsBySpecialtyName(@PathVariable String specialtyName) {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorsBySpecialtyRaw(specialtyName)));
    }
    
    @GetMapping("/stats")
    @Operation(summary = "Get doctor statistics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getStats()));
    }

    // Doctor portal endpoints (secured)
    @GetMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current doctor profile")
    public ResponseEntity<ApiResponse<DoctorResponse>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.success(doctorService.getDoctorProfileForUser(currentUser.getUser())));
    }

    @PostMapping("/me/profile")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create or update doctor profile for current user")
    public ResponseEntity<ApiResponse<DoctorResponse>> upsertMyProfile(@Valid @RequestBody DoctorProfileRequest request) {
        DoctorResponse response = doctorService.upsertDoctorProfile(currentUser.getUser(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Doctor profile saved"));
    }

    @GetMapping("/me/patients")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List patients linked to current doctor")
    public ResponseEntity<ApiResponse<List<PatientSummaryResponse>>> getMyPatients() {
        return ResponseEntity.ok(ApiResponse.success(doctorPatientService.getMyPatients()));
    }

    @PostMapping("/me/patients/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Link a patient to current doctor")
    public ResponseEntity<ApiResponse<PatientSummaryResponse>> addPatient(@PathVariable Long patientId) {
        PatientSummaryResponse response = doctorPatientService.addPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(response, "Patient linked"));
    }

    @DeleteMapping("/me/patients/{patientId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Unlink a patient from current doctor")
    public ResponseEntity<ApiResponse<Void>> removePatient(@PathVariable Long patientId) {
        doctorPatientService.removePatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(null, "Patient unlinked"));
    }

    @GetMapping("/me/patients/{patientId}/medications")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "List medications for a linked patient")
    public ResponseEntity<ApiResponse<List<MedicationResponse>>> getPatientMedications(@PathVariable Long patientId) {
        List<MedicationResponse> response = medicationService.getMedicationsForPatient(patientId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/me/patients/{patientId}/medications")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create medication for a linked patient")
    public ResponseEntity<ApiResponse<MedicationResponse>> createPatientMedication(
            @PathVariable Long patientId,
            @Valid @RequestBody MedicationRequest request) {
        MedicationResponse response = medicationService.createMedicationForPatient(patientId, request);
        return ResponseEntity.status(201).body(ApiResponse.created(response, "Medication created for patient"));
    }

    @PutMapping("/me/patients/{patientId}/medications/{medicationId}")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Update medication for a linked patient")
    public ResponseEntity<ApiResponse<MedicationResponse>> updatePatientMedication(
            @PathVariable Long patientId,
            @PathVariable Long medicationId,
            @Valid @RequestBody MedicationRequest request) {
        MedicationResponse response = medicationService.updateMedicationForPatient(patientId, medicationId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Medication updated"));
    }

    // ==================== Medication Modification Requests ====================

    @PostMapping("/me/modification-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Create a medication modification request for a patient")
    public ResponseEntity<ApiResponse<MedicationModificationRequestResponse>> createModificationRequest(
            @Valid @RequestBody MedicationModificationRequestDto request) {
        MedicationModificationRequestResponse response = doctorPatientService.createModificationRequest(request);
        return ResponseEntity.status(201).body(ApiResponse.created(response, "Modification request sent to patient"));
    }

    @GetMapping("/me/modification-requests")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get all modification requests created by current doctor")
    public ResponseEntity<ApiResponse<List<MedicationModificationRequestResponse>>> getDoctorRequests() {
        return ResponseEntity.ok(ApiResponse.success(doctorPatientService.getDoctorRequests()));
    }

    @GetMapping("/me/patients/{patientId}/can-modify")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Check if doctor can modify patient's medications")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> canModifyPatientMedication(@PathVariable Long patientId) {
        boolean canModify = doctorPatientService.canDoctorModifyPatientMedication(patientId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("canModify", canModify)));
    }

    @GetMapping("/me/patients/{patientId}/dose-logs")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get dose logs for a patient within date range")
    public ResponseEntity<ApiResponse<List<DoseLogResponse>>> getPatientDoseLogs(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Verify patient is linked to this doctor
        doctorPatientService.verifyPatientLinked(patientId);
        List<DoseLogResponse> response = doseLogService.getDoseLogsForPatient(patientId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me/patients/{patientId}/adherence")
    @PreAuthorize("hasRole('DOCTOR')")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get adherence statistics for a patient")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPatientAdherence(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        // Verify patient is linked to this doctor
        doctorPatientService.verifyPatientLinked(patientId);
        Map<String, Object> adherence = doseLogService.getAdherenceStatsForPatient(patientId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(adherence));
    }
}
