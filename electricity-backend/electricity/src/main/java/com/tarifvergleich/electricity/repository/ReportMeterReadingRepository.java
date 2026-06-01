package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerOrder;
import com.tarifvergleich.electricity.model.ReportMeterReading;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReportMeterReadingRepository extends JpaRepository<ReportMeterReading, Integer> {

	List<ReportMeterReading> findByDeliveryIdIn(List<Integer> deliveryIds);
}