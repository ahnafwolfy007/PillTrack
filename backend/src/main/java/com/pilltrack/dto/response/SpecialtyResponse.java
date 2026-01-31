package com.pilltrack.dto.response;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecialtyResponse {
    private Long id;
    private String name;
    private String displayName;
    private String description;
    private String iconName;
    private String slug;
    private Integer doctorCount;
}
