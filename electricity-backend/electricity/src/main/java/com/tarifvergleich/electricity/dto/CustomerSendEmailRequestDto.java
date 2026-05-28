package com.tarifvergleich.electricity.dto;

import lombok.Data;

import java.util.List;

@Data
public class CustomerSendEmailRequestDto {

    private Long adminId;

    private Long customerId;

    private String title;

    private String subtitle;

    private String emailContent;

    private List<Long> pdfIds;
}