package com.tarifvergleich.electricity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerInvoiceRequest;

@Repository
public interface CustomerInvoiceRequestRepository
        extends JpaRepository<CustomerInvoiceRequest, Integer> {

}