package com.pilltrack.repository;

import com.pilltrack.model.entity.DoctorPatient;
import com.pilltrack.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorPatientRepository extends JpaRepository<DoctorPatient, Long> {

    boolean existsByDoctorIdAndPatientId(Long doctorId, Long patientId);

    Optional<DoctorPatient> findByDoctorIdAndPatientId(Long doctorId, Long patientId);

    List<DoctorPatient> findByDoctorId(Long doctorId);

    void deleteByDoctorIdAndPatientId(Long doctorId, Long patientId);

    @Query("SELECT dp.patient FROM DoctorPatient dp WHERE dp.doctor.id = :doctorId")
    List<User> findPatientsByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT dp.patient FROM DoctorPatient dp WHERE dp.doctor.user.id = :doctorUserId")
    List<User> findPatientsByDoctorUserId(@Param("doctorUserId") Long doctorUserId);
}
