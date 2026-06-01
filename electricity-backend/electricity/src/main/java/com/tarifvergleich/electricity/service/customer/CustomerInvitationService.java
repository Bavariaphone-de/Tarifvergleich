package com.tarifvergleich.electricity.service.customer;

import java.math.BigInteger;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.CustomerInvitationDto;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerInvitation;
import com.tarifvergleich.electricity.model.ManageAdminDocument;
import com.tarifvergleich.electricity.model.TokenManagement;
import com.tarifvergleich.electricity.repository.CustomerInvitationRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;
import com.tarifvergleich.electricity.repository.TokenManagementRepository;
import com.tarifvergleich.electricity.service.AesEncryptionService;
import com.tarifvergleich.electricity.util.EmailBodyRender;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerInvitationService {

	private final AesEncryptionService aesEncryptionService;
	private final CustomerInvitationRepository customerInvitationRepo;
	private final TokenManagementRepository tokenManagementRespo;
	private final CustomerRepository customerRepo;
	private final EmailBodyRender emailBodyRender;
	private final ApplicationEventPublisher eventPublisher;
	private final Helper helper;

	@Transactional
	public Map<String, Object> sendInvitation(CustomerInvitationDto invitationDto) {

		if (invitationDto == null)
			throw new InternalServerException("Invitation data missing", HttpStatus.OK);
		if (invitationDto.getCustomerId() == null || invitationDto.getCustomerId() <= 0)
			throw new InternalServerException("Customer id missing", HttpStatus.OK);
		if (invitationDto.getAdminId() == null || invitationDto.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);
		if (invitationDto.getSendToEmail() == null || invitationDto.getSendToEmail().isEmpty())
			throw new InternalServerException("Email id missing", HttpStatus.OK);

		Customer customer = customerRepo
				.findByCustomerIdAndAdminAdminId(invitationDto.getCustomerId(), invitationDto.getAdminId())
				.orElseThrow(() -> new InternalServerException("Business Customer not found with this credential",
						HttpStatus.OK));

		if (!customer.getUserType().equalsIgnoreCase("BUSINESS"))
			throw new InternalServerException("Customer is not a business owner", HttpStatus.OK);

		String token = helper.generateUUId();

		TokenManagement tokenManagement = TokenManagement.builder().customerId(customer.getCustomerId()).token(token)
				.expiryDate(
						BigInteger.valueOf(ZonedDateTime.now(ZoneId.of("Europe/Berlin")).plusDays(1).toEpochSecond()))
				.build();

		CustomerInvitation invitation = CustomerInvitation.builder().businessCustomer(customer)
				.admin(customer.getAdmin()).sendToEmail(invitationDto.getSendToEmail()).build();

		String encryptedToken = "";
		try {
			encryptedToken = aesEncryptionService.encrypt(token);
		} catch (Exception e) {
			e.printStackTrace();
			new InternalServerException("Something went wrong in token", HttpStatus.OK);
		}

		if (encryptedToken.isEmpty())
			new InternalServerException("Problem creating token", HttpStatus.OK);

		tokenManagementRespo.save(tokenManagement);
		customerInvitationRepo.save(invitation);

		Map<String, Object> emailTemplate = emailBodyRender.businessCustomerSubAccountRegistrationBody(customer,
				encryptedToken);

		Set<ManageAdminDocument> docs = new HashSet<ManageAdminDocument>();
		if (emailTemplate.get("docs") instanceof Collection<?> rawCollection) {
			for (Object obj : rawCollection) {
				if (obj instanceof ManageAdminDocument doc) {
					docs.add(doc);
				}
			}
		}

		ServiceResponseEmailEvent mailEvent = new ServiceResponseEmailEvent(invitationDto.getSendToEmail(),
				emailTemplate.get("title").toString(), emailTemplate.get("body").toString(), docs);

		eventPublisher.publishEvent(mailEvent);
		return Map.of("res", true, "message", "Invitation send successfully");
	}

}
