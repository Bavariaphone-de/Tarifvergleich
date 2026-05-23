package com.tarifvergleich.electricity.repository;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.tarifvergleich.electricity.model.CustomerInvoiceRequest;

@Repository
public interface CustomerInvoiceRequestRepository
        extends JpaRepository<CustomerInvoiceRequest, Integer> {

    List<CustomerInvoiceRequest> findByDeliveryId(Integer deliveryId);

    List<CustomerInvoiceRequest> findByDeliveryIdIn(List<Integer> deliveryIds);
}

