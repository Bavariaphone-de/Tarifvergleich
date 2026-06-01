package com.tarifvergleich.electricity.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ReportMeterReadingDto {

	private Long customerId;
	
	private String customerName;
	
    private Integer deliveryId;

    private Integer orderId;

    private Integer connectionId;

    private String category;

    private String readingDate;

    private String meterReading;
    
    private Integer id;

    private String imagePath;

    private Integer status;

    private LocalDateTime createdAt;
}