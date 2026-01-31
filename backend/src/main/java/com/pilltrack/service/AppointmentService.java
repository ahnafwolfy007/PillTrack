package com.pilltrack.service;

import com.pilltrack.dto.request.AppointmentApprovalRequest;
import com.pilltrack.dto.request.AppointmentRequest;
import com.pilltrack.dto.response.AppointmentResponse;
import com.pilltrack.exception.BadRequestException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Appointment;
import com.pilltrack.model.entity.Doctor;
import com.pilltrack.model.entity.DoctorPatient;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.AppointmentStatus;
import com.pilltrack.model.enums.NotificationType;
import com.pilltrack.repository.AppointmentRepository;
import com.pilltrack.repository.DoctorPatientRepository;
import com.pilltrack.repository.DoctorRepository;
import com.pilltrack.repository.UserRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final DoctorPatientRepository doctorPatientRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    /**
     * Patient books an appointment with a doctor
     */
    public AppointmentResponse bookAppointment(AppointmentRequest request) {
        User patient = currentUser.getUser();

        Doctor doctor = doctorRepository.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor", "id", request.getDoctorId()));

        // Check if patient already has a pending/approved appointment with this doctor on this date
        boolean hasExisting = appointmentRepository.existsByDoctorIdAndPatientIdAndAppointmentDateAndStatusIn(
                doctor.getId(), patient.getId(), request.getAppointmentDate(),
                List.of(AppointmentStatus.PENDING, AppointmentStatus.APPROVED));

        if (hasExisting) {
            throw new BadRequestException("You already have a pending or approved appointment with this doctor on this date");
        }

        // Check if first visit with this doctor
        boolean isFirstVisit = !doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), patient.getId());

        // Get next serial number for the date
        Integer serialNumber = appointmentRepository.getNextSerialNumber(doctor.getId(), request.getAppointmentDate());

        Appointment appointment = Appointment.builder()
                .doctor(doctor)
                .patient(patient)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getPreferredTime())
                .serialNumber(serialNumber)
                .status(AppointmentStatus.PENDING)
                .symptoms(request.getSymptoms())
                .patientNotes(request.getPatientNotes())
                .consultationFee(doctor.getConsultationFee())
                .isFirstVisit(isFirstVisit)
                .build();

        appointment = appointmentRepository.save(appointment);

        // Notify doctor
        if (doctor.getUser() != null) {
            notificationService.createNotification(
                    doctor.getUser().getId(),
                    NotificationType.APPOINTMENT_REQUESTED,
                    "New Appointment Request",
                    String.format("%s has requested an appointment on %s", patient.getName(), request.getAppointmentDate()),
                    "/doctor/appointments"
            );
        }

        log.info("Patient {} booked appointment {} with doctor {}", patient.getId(), appointment.getId(), doctor.getId());

        return mapToResponse(appointment);
    }

    /**
     * Doctor approves or rejects an appointment
     */
    public AppointmentResponse respondToAppointment(Long appointmentId, AppointmentApprovalRequest request) {
        Doctor doctor = getCurrentDoctor();

        Appointment appointment = appointmentRepository.findByIdAndDoctorId(appointmentId, doctor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new BadRequestException("This appointment has already been processed");
        }

        if (request.isApprove()) {
            appointment.setStatus(AppointmentStatus.APPROVED);
            appointment.setApprovedAt(LocalDateTime.now());
            if (request.getAppointmentTime() != null) {
                appointment.setAppointmentTime(request.getAppointmentTime());
            }
            if (request.getDoctorNotes() != null) {
                appointment.setDoctorNotes(request.getDoctorNotes());
            }

            // Add patient to doctor's patient list if not already
            if (!doctorPatientRepository.existsByDoctorIdAndPatientId(doctor.getId(), appointment.getPatient().getId())) {
                DoctorPatient doctorPatient = DoctorPatient.builder()
                        .doctor(doctor)
                        .patient(appointment.getPatient())
                        .status("ACTIVE")
                        .canModifyMedication(false)
                        .build();
                doctorPatientRepository.save(doctorPatient);
                log.info("Added patient {} to doctor {} patient list", appointment.getPatient().getId(), doctor.getId());
            }

            // Notify patient
            notificationService.createNotification(
                    appointment.getPatient().getId(),
                    NotificationType.APPOINTMENT_APPROVED,
                    "Appointment Confirmed",
                    String.format("Your appointment with Dr. %s on %s has been confirmed. Serial: %d",
                            doctor.getName(), appointment.getAppointmentDate(), appointment.getSerialNumber()),
                    "/dashboard/appointments"
            );

            log.info("Doctor {} approved appointment {}", doctor.getId(), appointmentId);
        } else {
            appointment.setStatus(AppointmentStatus.REJECTED);
            appointment.setRejectionReason(request.getRejectionReason());

            // Notify patient
            notificationService.createNotification(
                    appointment.getPatient().getId(),
                    NotificationType.APPOINTMENT_REJECTED,
                    "Appointment Declined",
                    String.format("Your appointment request with Dr. %s on %s has been declined. Reason: %s",
                            doctor.getName(), appointment.getAppointmentDate(),
                            request.getRejectionReason() != null ? request.getRejectionReason() : "Not specified"),
                    "/dashboard/appointments"
            );

            log.info("Doctor {} rejected appointment {}", doctor.getId(), appointmentId);
        }

        appointment = appointmentRepository.save(appointment);
        return mapToResponse(appointment);
    }

    /**
     * Doctor marks appointment as completed
     */
    public AppointmentResponse completeAppointment(Long appointmentId, String doctorNotes) {
        Doctor doctor = getCurrentDoctor();

        Appointment appointment = appointmentRepository.findByIdAndDoctorId(appointmentId, doctor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        if (appointment.getStatus() != AppointmentStatus.APPROVED) {
            throw new BadRequestException("Only approved appointments can be marked as completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointment.setCompletedAt(LocalDateTime.now());
        if (doctorNotes != null) {
            appointment.setDoctorNotes(doctorNotes);
        }

        appointment = appointmentRepository.save(appointment);

        // Notify patient
        notificationService.createNotification(
                appointment.getPatient().getId(),
                NotificationType.APPOINTMENT_COMPLETED,
                "Appointment Completed",
                String.format("Your appointment with Dr. %s has been completed", doctor.getName()),
                "/dashboard/appointments"
        );

        log.info("Doctor {} completed appointment {}", doctor.getId(), appointmentId);
        return mapToResponse(appointment);
    }

    /**
     * Cancel an appointment (by patient or doctor)
     */
    public AppointmentResponse cancelAppointment(Long appointmentId, String reason) {
        User user = currentUser.getUser();
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", appointmentId));

        // Check if user is patient or doctor
        boolean isPatient = appointment.getPatient().getId().equals(user.getId());
        boolean isDoctor = appointment.getDoctor().getUser() != null && 
                           appointment.getDoctor().getUser().getId().equals(user.getId());

        if (!isPatient && !isDoctor) {
            throw new BadRequestException("You don't have permission to cancel this appointment");
        }

        if (appointment.getStatus() == AppointmentStatus.COMPLETED || 
            appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new BadRequestException("This appointment cannot be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointment.setDoctorNotes(reason);
        appointment = appointmentRepository.save(appointment);

        // Notify the other party
        if (isPatient && appointment.getDoctor().getUser() != null) {
            notificationService.createNotification(
                    appointment.getDoctor().getUser().getId(),
                    NotificationType.APPOINTMENT_CANCELLED,
                    "Appointment Cancelled",
                    String.format("Patient %s has cancelled the appointment on %s",
                            user.getName(), appointment.getAppointmentDate()),
                    "/doctor/appointments"
            );
        } else if (isDoctor) {
            notificationService.createNotification(
                    appointment.getPatient().getId(),
                    NotificationType.APPOINTMENT_CANCELLED,
                    "Appointment Cancelled",
                    String.format("Dr. %s has cancelled your appointment on %s",
                            appointment.getDoctor().getName(), appointment.getAppointmentDate()),
                    "/dashboard/appointments"
            );
        }

        log.info("User {} cancelled appointment {}", user.getId(), appointmentId);
        return mapToResponse(appointment);
    }

    // ==================== Get Methods ====================

    public List<AppointmentResponse> getPatientAppointments() {
        User patient = currentUser.getUser();
        return appointmentRepository.findByPatientIdOrderByAppointmentDateDescCreatedAtDesc(patient.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getPatientUpcomingAppointments() {
        User patient = currentUser.getUser();
        return appointmentRepository.findUpcomingAppointmentsForPatient(patient.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments() {
        Doctor doctor = getCurrentDoctor();
        return appointmentRepository.findByDoctorIdOrderByAppointmentDateDescCreatedAtDesc(doctor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorPendingAppointments() {
        Doctor doctor = getCurrentDoctor();
        return appointmentRepository.findPendingAppointmentsForDoctor(doctor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorUpcomingAppointments() {
        Doctor doctor = getCurrentDoctor();
        return appointmentRepository.findUpcomingApprovedAppointmentsForDoctor(doctor.getId())
                .stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    public AppointmentResponse getAppointmentById(Long id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment", "id", id));
        
        User user = currentUser.getUser();
        boolean isPatient = appointment.getPatient().getId().equals(user.getId());
        boolean isDoctor = appointment.getDoctor().getUser() != null && 
                           appointment.getDoctor().getUser().getId().equals(user.getId());

        if (!isPatient && !isDoctor) {
            throw new BadRequestException("You don't have access to this appointment");
        }

        return mapToResponse(appointment);
    }

    // ==================== Helper Methods ====================

    private Doctor getCurrentDoctor() {
        User user = currentUser.getUser();
        return doctorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BadRequestException("You are not registered as a doctor"));
    }

    private AppointmentResponse mapToResponse(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        User patient = appointment.getPatient();

        return AppointmentResponse.builder()
                .id(appointment.getId())
                .doctorId(doctor.getId())
                .doctorName(doctor.getName())
                .doctorSpecialty(doctor.getSpecialtyRaw())
                .doctorImageUrl(doctor.getImageUrl())
                .doctorRating(doctor.getRating())
                .doctorChamber(doctor.getChamber())
                .doctorPhone(doctor.getPhone())
                .patientId(patient.getId())
                .patientName(patient.getName())
                .patientEmail(patient.getEmail())
                .patientPhone(patient.getPhone())
                .appointmentDate(appointment.getAppointmentDate())
                .appointmentTime(appointment.getAppointmentTime())
                .serialNumber(appointment.getSerialNumber())
                .status(appointment.getStatus())
                .symptoms(appointment.getSymptoms())
                .patientNotes(appointment.getPatientNotes())
                .doctorNotes(appointment.getDoctorNotes())
                .rejectionReason(appointment.getRejectionReason())
                .consultationFee(appointment.getConsultationFee())
                .isFirstVisit(appointment.getIsFirstVisit())
                .createdAt(appointment.getCreatedAt())
                .approvedAt(appointment.getApprovedAt())
                .completedAt(appointment.getCompletedAt())
                .build();
    }
}
