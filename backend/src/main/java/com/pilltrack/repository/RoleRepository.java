package com.pilltrack.repository;

import com.pilltrack.model.entity.Role;
import com.pilltrack.model.enums.RoleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    Optional<Role> findByName(RoleType name);
    
    boolean existsByName(RoleType name);
}
