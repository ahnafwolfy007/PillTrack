package com.pilltrack.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    
    private boolean success;
    private String message;
    private T data;
    private Integer status;
    private String error;
    private List<String> errors;
    private Map<String, String> fieldErrors;
    private String timestamp;
    private String path;
    
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .message("Success")
                .data(data)
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
    
    public static <T> ApiResponse<T> success(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.OK.value())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
    
    public static <T> ApiResponse<T> created(T data, String message) {
        return ApiResponse.<T>builder()
                .success(true)
                .message(message)
                .data(data)
                .status(HttpStatus.CREATED.value())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, HttpStatus status) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(message)
                .status(status.value())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
    
    public static <T> ApiResponse<T> error(String message, HttpStatus status, String path) {
        return ApiResponse.<T>builder()
                .success(false)
                .message(message)
                .error(message)
                .status(status.value())
                .timestamp(LocalDateTime.now().toString())
                .path(path)
                .build();
    }
    
    public static <T> ApiResponse<T> validationError(Map<String, String> fieldErrors) {
        return ApiResponse.<T>builder()
                .success(false)
                .message("Validation failed")
                .error("Validation failed")
                .fieldErrors(fieldErrors)
                .status(HttpStatus.BAD_REQUEST.value())
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
