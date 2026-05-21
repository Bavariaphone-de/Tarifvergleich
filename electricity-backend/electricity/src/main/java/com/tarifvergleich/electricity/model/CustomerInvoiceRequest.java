package com.tarifvergleich.electricity.model;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "customer_invoice_request")

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerInvoiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer customerId;

    private Integer connectionId;
    
    private Integer orderId;

    private String invoiceCategory;

    @Column(columnDefinition = "TEXT")
    private String message;

    private LocalDateTime createdAt;
}