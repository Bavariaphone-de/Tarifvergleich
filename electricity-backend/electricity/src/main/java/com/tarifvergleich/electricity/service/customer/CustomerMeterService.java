package com.tarifvergleich.electricity.service.customer;

import java.util.Map;

import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.repository.CustomerConnectionRepository;

@Service
public class CustomerMeterService {

    private final CustomerConnectionRepository customerConnectionRepository;

    public CustomerMeterService(
            CustomerConnectionRepository customerConnectionRepository
    ) {
        this.customerConnectionRepository = customerConnectionRepository;
    }

    public Map<String, Object> updateMeterDesignation(
            Long connectionId,
            String meterDesignation
    ) {

        customerConnectionRepository.updateMeterDesignation(
                connectionId,
                meterDesignation
        );

        return Map.of(
                "res", true,
                "message", "Meter designation updated successfully"
        );
    }
}