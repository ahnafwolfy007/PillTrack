package com.pilltrack.repository;

import com.pilltrack.model.entity.Payment;
import com.pilltrack.model.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByOrderId(Long orderId);
    
    Optional<Payment> findByTransactionId(String transactionId);
    
    Optional<Payment> findByValidationId(String validationId);
    
    boolean existsByTransactionId(String transactionId);
    
    // Find by status
    List<Payment> findByStatus(PaymentStatus status);
    
    Page<Payment> findByStatus(PaymentStatus status, Pageable pageable);
    
    // Find by user
    @Query("SELECT p FROM Payment p WHERE p.order.user.id = :userId ORDER BY p.createdAt DESC")
    Page<Payment> findByUserId(@Param("userId") Long userId, Pageable pageable);
    
    // Find by shop
    @Query("SELECT p FROM Payment p WHERE p.order.shop.id = :shopId ORDER BY p.createdAt DESC")
    Page<Payment> findByShopId(@Param("shopId") Long shopId, Pageable pageable);
    
    // Revenue by shop
    @Query("SELECT COALESCE(SUM(p.storeAmount), 0) FROM Payment p WHERE p.order.shop.id = :shopId AND p.status = 'COMPLETED'")
    BigDecimal calculateTotalReceivedByShopId(@Param("shopId") Long shopId);
    
    @Query("SELECT COALESCE(SUM(p.storeAmount), 0) FROM Payment p WHERE p.order.shop.id = :shopId AND p.status = 'COMPLETED' AND p.paidAt BETWEEN :startDate AND :endDate")
    BigDecimal calculateReceivedByShopIdAndDateRange(@Param("shopId") Long shopId,
                                                      @Param("startDate") LocalDateTime startDate,
                                                      @Param("endDate") LocalDateTime endDate);
    
    // Pending payments
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :before")
    List<Payment> findStalePendingPayments(@Param("before") LocalDateTime before);
    
    // Payment count by status for shop
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.order.shop.id = :shopId AND p.status = :status")
    long countByShopIdAndStatus(@Param("shopId") Long shopId, @Param("status") PaymentStatus status);
}
