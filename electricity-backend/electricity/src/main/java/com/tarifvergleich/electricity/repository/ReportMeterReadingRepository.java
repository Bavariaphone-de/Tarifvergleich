package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tarifvergleich.electricity.model.ReportMeterReading;

import java.util.List;



public interface ReportMeterReadingRepository
        extends JpaRepository<ReportMeterReading, Integer> {
	
	  List<ReportMeterReading> findByDeliveryIdIn(
	            List<Integer> deliveryIds);
}