package com.pilltrack.repository;

import com.pilltrack.model.entity.MedicationModificationRequest;
import com.pilltrack.model.enums.ModificationRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicationModificationRequestRepository extends JpaRepository<MedicationModificationRequest, Long> {

    List<MedicationModificationRequest> findByPatientIdAndStatus(Long patientId, ModificationRequestStatus status);

    List<MedicationModificationRequest> findByPatientId(Long patientId);

    List<MedicationModificationRequest> findByDoctorId(Long doctorId);

    List<MedicationModificationRequest> findByDoctorIdAndStatus(Long doctorId, ModificationRequestStatus status);

    @Query("SELECT m FROM MedicationModificationRequest m WHERE m.patient.id = :patientId ORDER BY m.createdAt DESC")
    List<MedicationModificationRequest> findByPatientIdOrderByCreatedAtDesc(@Param("patientId") Long patientId);

    @Query("SELECT m FROM MedicationModificationRequest m WHERE m.doctor.id = :doctorId ORDER BY m.createdAt DESC")
    List<MedicationModificationRequest> findByDoctorIdOrderByCreatedAtDesc(@Param("doctorId") Long doctorId);

    @Query("SELECT m FROM MedicationModificationRequest m WHERE m.status = :status AND m.expiresAt < :now")
    List<MedicationModificationRequest> findExpiredRequests(@Param("status") ModificationRequestStatus status, @Param("now") LocalDateTime now);

    boolean existsByDoctorIdAndPatientIdAndMedicationIdAndStatus(Long doctorId, Long patientId, Long medicationId, ModificationRequestStatus status);

    @Query("SELECT COUNT(m) FROM MedicationModificationRequest m WHERE m.patient.id = :patientId AND m.status = 'PENDING'")
    long countPendingRequestsForPatient(@Param("patientId") Long patientId);

    @Query("SELECT COUNT(m) FROM MedicationModificationRequest m WHERE m.doctor.id = :doctorId AND m.status = 'PENDING'")
    long countPendingRequestsForDoctor(@Param("doctorId") Long doctorId);
}
