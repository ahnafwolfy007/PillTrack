package com.pilltrack.dto.response;

import com.pilltrack.model.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponse {
    
    private Long id;
    private NotificationType type;
    private String title;
    private String message;
    private Boolean isRead;
    private String actionUrl;
    private LocalDateTime createdAt;
}
