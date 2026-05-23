package com.tarifvergleich.electricity.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInvoiceRequestDto {

    private Integer id;

    private Integer customerId;

    private Integer connectionId;

    private Integer orderId;

    private Integer deliveryId;

    private String invoiceCategory;

    private String message;
    
    private Integer status;

    private LocalDateTime createdAt;
}