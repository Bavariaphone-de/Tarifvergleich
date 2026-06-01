package com.tarifvergleich.electricity.service.admin;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerOrder;
import com.tarifvergleich.electricity.model.ManageAdminDocument;
import com.tarifvergleich.electricity.model.TokenManagement;
import com.tarifvergleich.electricity.repository.CustomerOrderRepository;
import com.tarifvergleich.electricity.repository.TokenManagementRepository;
import com.tarifvergleich.electricity.service.AesEncryptionService;
import com.tarifvergleich.electricity.util.EmailBodyRender;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AsyncServiceAdmin {

	private final CustomerOrderRepository customerOrderRepo;
	private final AesEncryptionService aesEncryptionService;
	private final TokenManagementRepository contractTokenRespo;
	private final Helper helper;
	private final ApplicationEventPublisher eventPublisher;
	private final EmailBodyRender emailBodyRender;

	@Value("${app.secrets.aes-expiry}")
	private Long TokenExpiry;

	@Async
	@Transactional
	public void sendMailToCustomerForSignatures(Integer customerOrderId) {

		if (customerOrderId == null || customerOrderId <= 0)
			throw new InternalServerException("Customer order id missing", HttpStatus.OK);

		CustomerOrder order = customerOrderRepo.findById(customerOrderId)
				.orElseThrow(() -> new InternalServerException("Customer order not found", HttpStatus.OK));

		Customer customer = order.getCustomer();

		BigInteger getExpiry = helper.toGermamUnixTimestamp(
				LocalDate.now().atStartOfDay().atZone(ZoneId.of("Europe/Berlin")).plusDays(TokenExpiry).toLocalDate());

		String token = helper.generateUUId();

		TokenManagement newContractToken = TokenManagement.builder().orderId(customerOrderId).token(token)
				.expiryDate(getExpiry).build();

		newContractToken = contractTokenRespo.save(newContractToken);

		String securedToken = "";
		try {
			securedToken = aesEncryptionService.encrypt(token);
		} catch (Exception e) {
			e.printStackTrace();
			throw new RuntimeException();
		}

		if (securedToken.isEmpty())
			throw new InternalServerException("Validation token cannot be generated", HttpStatus.OK);

		order.setEmailSendToCustomerForSignature(true);

		customerOrderRepo.save(order);

		Map<String, Object> emailTemplate = emailBodyRender.orderSignatureBody(customer, securedToken, customerOrderId);

		Set<ManageAdminDocument> docs = new HashSet<ManageAdminDocument>();
		if (emailTemplate.get("docs") instanceof Collection<?> rawCollection) {
			for (Object obj : rawCollection) {
				if (obj instanceof ManageAdminDocument doc) {
					docs.add(doc);
				}
			}
		}

		ServiceResponseEmailEvent emailEvent = new ServiceResponseEmailEvent(customer.getEmail(),
				"Bitte unterschreiben Sie Ihren Vertrag: (Contract Number: " + order.getOrderId() + ")",
				emailTemplate.get("body").toString(), docs);

//		ServiceResponseEmailEvent emailEvent = new ServiceResponseEmailEvent("syntnpddr@gmail.com",
//				"Bitte unterschreiben Sie Ihren Vertrag: (Contract Number: " + customerOrderId + ")", mailBody);

		eventPublisher.publishEvent(emailEvent);
	}
}
