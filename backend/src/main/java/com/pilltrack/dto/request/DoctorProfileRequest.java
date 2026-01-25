package com.pilltrack.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorProfileRequest {

    @NotBlank(message = "Name is required")
    @Size(max = 300, message = "Name must not exceed 300 characters")
    private String name;

    @Size(max = 500, message = "Education must not exceed 500 characters")
    private String education;

    private Long specialtyId;

    @Size(max = 300, message = "Specialty must not exceed 300 characters")
    private String specialtyRaw;

    private Integer experienceYears;

    @Size(max = 500, message = "Chamber must not exceed 500 characters")
    private String chamber;

    @Size(max = 300, message = "Location must not exceed 300 characters")
    private String location;

    @Size(max = 1000, message = "Concentrations must not exceed 1000 characters")
    private String concentrations;

    @Size(max = 50, message = "Phone must not exceed 50 characters")
    private String phone;

    @Size(max = 200, message = "Email must not exceed 200 characters")
    private String email;

    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    private String imageUrl;

    private Double consultationFee;

    private Boolean isAvailable;
}
