package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tarifvergleich.electricity.model.CustomerOrderStatusRecord;

public interface CustomerOrderStatusRecordRepository extends JpaRepository<CustomerOrderStatusRecord, Long> {

}
