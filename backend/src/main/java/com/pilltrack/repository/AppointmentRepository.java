package com.pilltrack.repository;

import com.pilltrack.model.entity.Appointment;
import com.pilltrack.model.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatientIdOrderByAppointmentDateDescCreatedAtDesc(Long patientId);

    List<Appointment> findByDoctorIdOrderByAppointmentDateDescCreatedAtDesc(Long doctorId);

    List<Appointment> findByDoctorIdAndStatus(Long doctorId, AppointmentStatus status);

    List<Appointment> findByPatientIdAndStatus(Long patientId, AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date ORDER BY a.serialNumber ASC")
    List<Appointment> findByDoctorIdAndAppointmentDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status = :status ORDER BY a.serialNumber ASC")
    List<Appointment> findByDoctorIdAndAppointmentDateAndStatus(
            @Param("doctorId") Long doctorId, 
            @Param("date") LocalDate date, 
            @Param("status") AppointmentStatus status);

    @Query("SELECT COALESCE(MAX(a.serialNumber), 0) + 1 FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date")
    Integer getNextSerialNumber(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate = :date AND a.status IN ('PENDING', 'APPROVED')")
    Long countAppointmentsForDate(@Param("doctorId") Long doctorId, @Param("date") LocalDate date);

    boolean existsByDoctorIdAndPatientIdAndAppointmentDateAndStatusIn(
            Long doctorId, Long patientId, LocalDate date, List<AppointmentStatus> statuses);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = 'PENDING' ORDER BY a.createdAt ASC")
    List<Appointment> findPendingAppointmentsForDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.patient.id = :patientId AND a.status IN ('PENDING', 'APPROVED') ORDER BY a.appointmentDate ASC")
    List<Appointment> findUpcomingAppointmentsForPatient(@Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.status = 'APPROVED' AND a.appointmentDate >= CURRENT_DATE ORDER BY a.appointmentDate ASC, a.serialNumber ASC")
    List<Appointment> findUpcomingApprovedAppointmentsForDoctor(@Param("doctorId") Long doctorId);

    @Query("SELECT a FROM Appointment a WHERE a.doctor.id = :doctorId AND a.appointmentDate BETWEEN :startDate AND :endDate ORDER BY a.appointmentDate ASC, a.serialNumber ASC")
    List<Appointment> findByDoctorIdAndDateRange(
            @Param("doctorId") Long doctorId, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate);

    Optional<Appointment> findByIdAndDoctorId(Long id, Long doctorId);

    Optional<Appointment> findByIdAndPatientId(Long id, Long patientId);
}
