package com.pilltrack.repository;

import com.pilltrack.model.entity.MedicineManufacturer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineManufacturerRepository extends JpaRepository<MedicineManufacturer, Long> {
    
    Optional<MedicineManufacturer> findByName(String name);
    
    Optional<MedicineManufacturer> findBySlug(String slug);
    
    boolean existsByName(String name);
    
    List<MedicineManufacturer> findByIsActiveTrueOrderByNameAsc();
    
    @Query("SELECT m FROM MedicineManufacturer m WHERE " +
           "LOWER(m.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.country) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<MedicineManufacturer> search(@Param("query") String query, Pageable pageable);
    
    List<MedicineManufacturer> findByCountry(String country);
    
    @Query("SELECT DISTINCT m.country FROM MedicineManufacturer m WHERE m.isActive = true ORDER BY m.country")
    List<String> findAllCountries();
}
