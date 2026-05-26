package com.tarifvergleich.electricity.service.customer;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerCronOrderService {

	private final ApplicationEventPublisher eventPublisher;

	@Async("orderStatusCronExecutor")
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void checkStatusAndSendMail(Integer customerOrderId) {

	}
}
