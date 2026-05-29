package com.tarifvergleich.electricity.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerSendEmailRequestDto {

    private Long adminId;

    private Long customerId;

//    private String email;
    
    private String title;

    private String subtitle;

    private String emailContent;

    private List<Long> documentIds;
}