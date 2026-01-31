package com.pilltrack.repository;

import com.pilltrack.model.entity.MedicineCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicineCategoryRepository extends JpaRepository<MedicineCategory, Long> {
    
    Optional<MedicineCategory> findByName(String name);
    
    Optional<MedicineCategory> findBySlug(String slug);
    
    boolean existsByName(String name);
    
    boolean existsBySlug(String slug);
    
    List<MedicineCategory> findByIsActiveTrueOrderByNameAsc();
    
    @Query("SELECT c FROM MedicineCategory c WHERE " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<MedicineCategory> search(@Param("query") String query, Pageable pageable);
}
