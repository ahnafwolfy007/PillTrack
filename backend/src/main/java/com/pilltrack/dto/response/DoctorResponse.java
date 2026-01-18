package com.pilltrack.dto.response;

import lombok.*;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorResponse {
    private Long id;
    private String name;
    private String education;
    private String specialty;
    private String specialtyDisplayName;
    private Long specialtyId;
    private Integer experienceYears;
    private String chamber;
    private String location;
    private List<String> concentrations;
    private String phone;
    private String email;
    private String imageUrl;
    private Double consultationFee;
    private Double rating;
    private Integer ratingCount;
    private Boolean isAvailable;
}
