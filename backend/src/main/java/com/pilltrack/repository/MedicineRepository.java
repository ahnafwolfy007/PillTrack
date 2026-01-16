package com.pilltrack.repository;

import com.pilltrack.model.entity.Medicine;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineRepository extends JpaRepository<Medicine, Long>, JpaSpecificationExecutor<Medicine> {
    
    Optional<Medicine> findBySlug(String slug);
    
    boolean existsBySlug(String slug);
    
    // Search by brand name or generic name
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND " +
           "(LOWER(m.brandName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Medicine> searchByName(@Param("query") String query, Pageable pageable);
    
    // Full-text search across multiple fields
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND " +
           "(LOWER(m.brandName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.genericName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.strength) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(m.dosageForm) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Medicine> fullTextSearch(@Param("query") String query, Pageable pageable);
    
    // Find by type (allopathic, herbal, etc.)
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.type) = LOWER(:type)")
    Page<Medicine> findByType(@Param("type") String type, Pageable pageable);
    
    // Find by manufacturer
    Page<Medicine> findByManufacturerIdAndIsActiveTrue(Long manufacturerId, Pageable pageable);
    
    List<Medicine> findByManufacturerIdAndIsActiveTrue(Long manufacturerId);
    
    // Find by dosage form (tablet, syrup, etc.)
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.dosageForm) = LOWER(:dosageForm)")
    Page<Medicine> findByDosageForm(@Param("dosageForm") String dosageForm, Pageable pageable);
    
    // Get distinct types (for category filter)
    @Query("SELECT DISTINCT m.type FROM Medicine m WHERE m.isActive = true AND m.type IS NOT NULL ORDER BY m.type")
    List<String> findAllTypes();
    
    // Get distinct dosage forms
    @Query("SELECT DISTINCT m.dosageForm FROM Medicine m WHERE m.isActive = true AND m.dosageForm IS NOT NULL ORDER BY m.dosageForm")
    List<String> findAllDosageForms();
    
    // Get distinct generic names (for generic-based category)
    @Query("SELECT DISTINCT m.genericName FROM Medicine m WHERE m.isActive = true AND m.genericName IS NOT NULL ORDER BY m.genericName")
    List<String> findAllGenericNames();
    
    // Find by generic name (exact match for finding alternatives)
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.genericName) = LOWER(:genericName) AND m.id != :excludeId")
    List<Medicine> findAlternatives(@Param("genericName") String genericName, @Param("excludeId") Long excludeId);
    
    // Find by generic name containing
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true AND LOWER(m.genericName) LIKE LOWER(CONCAT('%', :genericName, '%'))")
    Page<Medicine> findByGenericNameContaining(@Param("genericName") String genericName, Pageable pageable);
    
    // Increment view count
    @Modifying
    @Query("UPDATE Medicine m SET m.viewCount = m.viewCount + 1 WHERE m.id = :id")
    void incrementViewCount(@Param("id") Long id);
    
    // Find popular medicines
    @Query("SELECT m FROM Medicine m WHERE m.isActive = true ORDER BY m.viewCount DESC")
    Page<Medicine> findPopular(Pageable pageable);
    
    // Find all active medicines
    Page<Medicine> findByIsActiveTrue(Pageable pageable);
    
    // Find by generic name and excluding one id
    List<Medicine> findByGenericNameAndIdNot(String genericName, Long id);
    
    // Count by type
    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.type = :type AND m.isActive = true")
    long countByType(@Param("type") String type);
    
    // Count by manufacturer
    @Query("SELECT COUNT(m) FROM Medicine m WHERE m.manufacturer.id = :manufacturerId AND m.isActive = true")
    long countByManufacturerId(@Param("manufacturerId") Long manufacturerId);
}
