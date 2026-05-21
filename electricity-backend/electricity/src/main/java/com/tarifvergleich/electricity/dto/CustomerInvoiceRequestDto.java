package com.tarifvergleich.electricity.dto;

import lombok.Data;

@Data
public class CustomerInvoiceRequestDto {

    private Integer customerId;

    private Integer connectionId;

    private String invoiceCategory;

    private Integer orderId;

    private String message;
}