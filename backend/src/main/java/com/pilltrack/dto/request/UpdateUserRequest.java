package com.pilltrack.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserRequest {
    
    @Size(max = 50, message = "First name must not exceed 50 characters")
    private String firstName;
    
    @Size(max = 50, message = "Last name must not exceed 50 characters")
    private String lastName;
    
    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;
    
    private LocalDate dateOfBirth;
    
    @Size(max = 10, message = "Gender must not exceed 10 characters")
    private String gender;
    
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;
    
    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;
    
    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;
    
    @Size(max = 20, message = "Postal code must not exceed 20 characters")
    private String postalCode;
    
    @Size(max = 500, message = "Avatar URL must not exceed 500 characters")
    private String avatarUrl;
    
    @Size(max = 5, message = "Blood type must not exceed 5 characters")
    private String bloodType;
    
    @Size(max = 1000, message = "Allergies must not exceed 1000 characters")
    private String allergies;
    
    @Size(max = 200, message = "Emergency contact must not exceed 200 characters")
    private String emergencyContact;
}
