package com.tarifvergleich.electricity.service.admin;

import java.util.List;

import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.CustomerInvoiceRequestDto;
import com.tarifvergleich.electricity.dto.CustomerInvoiceRequestDto.CustomerInvoiceRequestResponseForAdminDto;
import com.tarifvergleich.electricity.model.CustomerInvoiceRequest;
import com.tarifvergleich.electricity.model.CustomerOrder;
import com.tarifvergleich.electricity.repository.CustomerInvoiceRequestRepository;
import com.tarifvergleich.electricity.repository.CustomerOrderRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;


import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCustomerInvoiceRequestService {

	private final CustomerInvoiceRequestRepository customerInvoiceRequestRepository;
	private final CustomerRepository customerRepository;
	private final CustomerOrderRepository customerOrderRepository;

	public List<CustomerInvoiceRequestResponseForAdminDto> getAllInvoiceRequests() {

		return customerInvoiceRequestRepository.findAll().stream().map(entity -> convertToDto(entity)).toList();
	}
	
	public List<CustomerInvoiceRequestResponseForAdminDto> getAllInvoiceRequests(String search) {

	    if (search == null || search.trim().isEmpty()) {
	        return getAllInvoiceRequests();
	    }

	    return customerInvoiceRequestRepository
	            .searchInvoiceRequests(search.trim())
	            .stream()
	            .map(this::convertToDto)
	            .toList();
	}
	
	private CustomerInvoiceRequestResponseForAdminDto convertToDto(CustomerInvoiceRequest entity) {

		CustomerOrder order = customerOrderRepository.findByOrderId(Long.valueOf(entity.getOrderId())).orElse(null);
		return CustomerInvoiceRequestDto.mapForAdminResponse(entity, order);
	}
}