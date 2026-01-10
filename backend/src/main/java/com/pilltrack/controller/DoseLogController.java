package com.pilltrack.controller;

import com.pilltrack.dto.request.DoseLogRequest;
import com.pilltrack.dto.response.ApiResponse;
import com.pilltrack.dto.response.DoseLogResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.service.DoseLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/dose-logs")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Dose Logs", description = "Dose tracking endpoints")
public class DoseLogController {
    
    private final DoseLogService doseLogService;
    
    @GetMapping("/today")
    @Operation(summary = "Get today's doses")
    public ResponseEntity<ApiResponse<List<DoseLogResponse>>> getTodaysDoses() {
        List<DoseLogResponse> response = doseLogService.getTodaysDoses();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/range")
    @Operation(summary = "Get doses by date range")
    public ResponseEntity<ApiResponse<List<DoseLogResponse>>> getDosesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DoseLogResponse> response = doseLogService.getDoseLogsByDateRange(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @GetMapping("/medication/{medicationId}")
    @Operation(summary = "Get doses for a specific medication")
    public ResponseEntity<ApiResponse<PageResponse<DoseLogResponse>>> getDosesByMedication(
            @PathVariable Long medicationId,
            @PageableDefault(size = 20, sort = "scheduledTime", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<DoseLogResponse> response = doseLogService.getDoseLogsByMedication(medicationId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
    
    @PostMapping
    @Operation(summary = "Log a dose")
    public ResponseEntity<ApiResponse<DoseLogResponse>> logDose(@Valid @RequestBody DoseLogRequest request) {
        DoseLogResponse response = doseLogService.logDose(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Dose logged successfully"));
    }
    
    @PutMapping("/{id}")
    @Operation(summary = "Update a dose log")
    public ResponseEntity<ApiResponse<DoseLogResponse>> updateDoseLog(
            @PathVariable Long id,
            @Valid @RequestBody DoseLogRequest request) {
        DoseLogResponse response = doseLogService.updateDoseLog(id, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Dose log updated successfully"));
    }
    
    @PostMapping("/{id}/take")
    @Operation(summary = "Mark dose as taken")
    public ResponseEntity<ApiResponse<DoseLogResponse>> markDoseTaken(@PathVariable Long id) {
        DoseLogResponse response = doseLogService.markDoseTaken(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Dose marked as taken"));
    }
    
    @PostMapping("/{id}/skip")
    @Operation(summary = "Mark dose as skipped")
    public ResponseEntity<ApiResponse<DoseLogResponse>> markDoseSkipped(
            @PathVariable Long id,
            @RequestParam(required = false) String reason) {
        DoseLogResponse response = doseLogService.markDoseSkipped(id, reason);
        return ResponseEntity.ok(ApiResponse.success(response, "Dose marked as skipped"));
    }
    
    @GetMapping("/adherence/{medicationId}")
    @Operation(summary = "Get adherence percentage for a medication")
    public ResponseEntity<ApiResponse<Long>> getAdherence(
            @PathVariable Long medicationId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        long adherence = doseLogService.getAdherencePercentage(medicationId, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(adherence));
    }
}
