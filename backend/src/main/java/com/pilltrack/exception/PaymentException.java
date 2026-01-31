package com.pilltrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.PAYMENT_REQUIRED)
public class PaymentException extends RuntimeException {
    
    private String transactionId;
    private String errorCode;
    
    public PaymentException(String message) {
        super(message);
    }
    
    public PaymentException(String message, String transactionId, String errorCode) {
        super(message);
        this.transactionId = transactionId;
        this.errorCode = errorCode;
    }
    
    public PaymentException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public String getTransactionId() {
        return transactionId;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
}
