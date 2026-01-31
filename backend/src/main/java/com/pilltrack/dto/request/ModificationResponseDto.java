package com.pilltrack.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModificationResponseDto {

    private boolean accept; // true = accept, false = reject

    private String responseMessage; // Patient's response message
}
