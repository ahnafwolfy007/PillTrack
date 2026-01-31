package com.pilltrack.repository;

import com.pilltrack.model.entity.Specialty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpecialtyRepository extends JpaRepository<Specialty, Long> {
    
    Optional<Specialty> findByName(String name);
    
    Optional<Specialty> findBySlug(String slug);
    
    List<Specialty> findByIsActiveTrueOrderByDisplayNameAsc();
    
    @Query("SELECT s FROM Specialty s WHERE s.isActive = true AND " +
           "(LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.displayName) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Specialty> searchByNameOrDisplayName(@Param("query") String query);
    
    @Query("SELECT s FROM Specialty s LEFT JOIN FETCH s.doctors WHERE s.id = :id")
    Optional<Specialty> findByIdWithDoctors(@Param("id") Long id);
    
    boolean existsByName(String name);
}
