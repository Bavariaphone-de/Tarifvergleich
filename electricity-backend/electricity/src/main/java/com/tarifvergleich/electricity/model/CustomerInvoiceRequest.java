package com.tarifvergleich.electricity.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "customer_invoice_request")

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class CustomerInvoiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer customerId;

    private Integer connectionId;
    
    private Integer orderId;
    
    private Integer deliveryId;

    private String invoiceCategory;

    @Column(columnDefinition = "TEXT")
    private String message;

    private Integer status;
    
    private LocalDateTime createdAt;
}