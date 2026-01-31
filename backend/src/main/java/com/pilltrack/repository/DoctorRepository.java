package com.pilltrack.repository;

import com.pilltrack.model.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.id = :id")
    Optional<Doctor> findByIdWithSpecialty(@Param("id") Long id);

    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.user.id = :userId")
    Optional<Doctor> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.isActive = true")
    List<Doctor> findAllActiveWithSpecialty();
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty s WHERE d.isActive = true AND s.id = :specialtyId")
    List<Doctor> findBySpecialtyIdWithSpecialty(@Param("specialtyId") Long specialtyId);
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty s WHERE d.isActive = true AND " +
           "(LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.specialtyRaw) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.displayName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.concentrations) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Doctor> searchDoctors(@Param("query") String query);
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.isActive = true ORDER BY d.rating DESC")
    List<Doctor> findTopRatedDoctors(Pageable pageable);
    
    @Query("SELECT DISTINCT d.location FROM Doctor d WHERE d.isActive = true AND d.location IS NOT NULL")
    List<String> findAllLocations();
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.isActive = true AND LOWER(d.location) LIKE LOWER(CONCAT('%', :location, '%'))")
    List<Doctor> findByLocation(@Param("location") String location);
    
    long countByIsActiveTrue();
    
    @Query("SELECT COUNT(DISTINCT d.specialty.id) FROM Doctor d WHERE d.isActive = true AND d.specialty IS NOT NULL")
    long countDistinctSpecialties();
    
    @Query("SELECT COUNT(DISTINCT d.specialtyRaw) FROM Doctor d WHERE d.isActive = true AND d.specialtyRaw IS NOT NULL")
    long countDistinctRawSpecialties();
    
    @Query("SELECT d.specialtyRaw, COUNT(d) FROM Doctor d WHERE d.isActive = true AND d.specialtyRaw IS NOT NULL GROUP BY d.specialtyRaw ORDER BY d.specialtyRaw")
    List<Object[]> findAllRawSpecialtiesWithCount();
    
    @Query("SELECT d FROM Doctor d LEFT JOIN FETCH d.specialty WHERE d.isActive = true AND LOWER(d.specialtyRaw) = LOWER(:specialtyRaw)")
    List<Doctor> findBySpecialtyRaw(@Param("specialtyRaw") String specialtyRaw);
}
