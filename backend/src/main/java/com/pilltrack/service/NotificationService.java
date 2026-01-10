package com.pilltrack.service;

import com.pilltrack.dto.response.NotificationResponse;
import com.pilltrack.dto.response.PageResponse;
import com.pilltrack.exception.AccessDeniedException;
import com.pilltrack.exception.ResourceNotFoundException;
import com.pilltrack.model.entity.Notification;
import com.pilltrack.model.entity.User;
import com.pilltrack.model.enums.NotificationType;
import com.pilltrack.repository.NotificationRepository;
import com.pilltrack.repository.UserRepository;
import com.pilltrack.security.CurrentUser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {
    
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;
    
    @Transactional(readOnly = true)
    public List<NotificationResponse> getCurrentUserNotifications() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> getCurrentUserNotificationsPaged(Pageable pageable) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Page<Notification> notificationsPage = notificationRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), pageable);
        return buildPageResponse(notificationsPage);
    }
    
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnreadNotifications() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public long getUnreadCount() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        return notificationRepository.countUnreadByUserId(user.getId());
    }
    
    @Transactional
    public void markAsRead(Long notificationId) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to access this notification");
        }
        
        notification.setIsRead(true);
        notificationRepository.save(notification);
        
        log.info("Notification {} marked as read", notificationId);
    }
    
    @Transactional
    public void markAllAsRead() {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        int count = notificationRepository.markAllAsReadByUserId(user.getId());
        log.info("Marked {} notifications as read for user {}", count, user.getEmail());
    }
    
    @Transactional
    public void deleteNotification(Long notificationId) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", "id", notificationId));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("You don't have permission to delete this notification");
        }
        
        notificationRepository.delete(notification);
        log.info("Notification {} deleted", notificationId);
    }
    
    @Transactional
    public void deleteOldNotifications(int daysOld) {
        User user = currentUser.getUser();
        if (user == null) {
            throw new ResourceNotFoundException("User not found");
        }
        
        LocalDateTime before = LocalDateTime.now().minusDays(daysOld);
        int count = notificationRepository.deleteOldNotificationsByUserId(user.getId(), before);
        log.info("Deleted {} old notifications for user {}", count, user.getEmail());
    }
    
    // Method for internal use (creating notifications)
    @Transactional
    public Notification createNotification(Long userId, NotificationType type, String title, String message, String actionUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .actionUrl(actionUrl)
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        log.info("Notification created: {} for user {}", title, user.getEmail());
        
        return notification;
    }
    
    // Convenience methods for specific notification types
    public void sendMedicationReminder(Long userId, String medicationName, String time) {
        createNotification(
                userId,
                NotificationType.MEDICATION_REMINDER,
                "Time for your medication",
                String.format("Don't forget to take %s at %s", medicationName, time),
                "/dashboard/medications"
        );
    }
    
    public void sendMedicationReminder(User user, String medicationName, String dosage, java.time.LocalTime time) {
        createNotification(
                user.getId(),
                NotificationType.MEDICATION_REMINDER,
                "Time for your medication",
                String.format("Don't forget to take %s (%s) at %s", medicationName, dosage, time.toString()),
                "/dashboard/medications"
        );
    }
    
    public void sendLowStockAlert(Long userId, String medicationName, int currentQuantity) {
        createNotification(
                userId,
                NotificationType.LOW_STOCK,
                "Low Stock Alert",
                String.format("%s is running low. Only %d units left.", medicationName, currentQuantity),
                "/dashboard/medications"
        );
    }
    
    public void sendLowStockAlert(User user, String medicationName, int currentQuantity) {
        sendLowStockAlert(user.getId(), medicationName, currentQuantity);
    }
    
    public void sendOrderStatusUpdate(Long userId, String orderNumber, String status) {
        NotificationType type = switch (status.toUpperCase()) {
            case "CONFIRMED" -> NotificationType.ORDER_CONFIRMED;
            case "SHIPPED" -> NotificationType.ORDER_SHIPPED;
            case "DELIVERED" -> NotificationType.ORDER_DELIVERED;
            case "CANCELLED" -> NotificationType.ORDER_CANCELLED;
            default -> NotificationType.ORDER_PLACED;
        };
        
        createNotification(
                userId,
                type,
                "Order Update",
                String.format("Your order %s status has been updated to: %s", orderNumber, status),
                "/dashboard/orders"
        );
    }
    
    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .actionUrl(notification.getActionUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
    
    private PageResponse<NotificationResponse> buildPageResponse(Page<Notification> notificationsPage) {
        List<NotificationResponse> notifications = notificationsPage.getContent().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        
        return PageResponse.<NotificationResponse>builder()
                .content(notifications)
                .pageNumber(notificationsPage.getNumber())
                .pageSize(notificationsPage.getSize())
                .totalElements(notificationsPage.getTotalElements())
                .totalPages(notificationsPage.getTotalPages())
                .first(notificationsPage.isFirst())
                .last(notificationsPage.isLast())
                .hasNext(notificationsPage.hasNext())
                .hasPrevious(notificationsPage.hasPrevious())
                .build();
    }
}
