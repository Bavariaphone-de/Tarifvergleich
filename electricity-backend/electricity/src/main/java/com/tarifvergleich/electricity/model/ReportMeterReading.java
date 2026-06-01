package com.tarifvergleich.electricity.model;

import java.time.LocalDateTime;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "report_meter_reading")
@Data
public class ReportMeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    private Integer deliveryId;

    private Integer orderId;

    private Integer connectionId;

    private String category;

    private String readingDate;

    private String meterReading;

    private String imagePath;

    private Integer status;

    private LocalDateTime createdAt;
}