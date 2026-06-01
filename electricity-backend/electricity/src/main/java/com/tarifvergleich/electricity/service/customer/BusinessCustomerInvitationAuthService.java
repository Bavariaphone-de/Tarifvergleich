package com.tarifvergleich.electricity.service.customer;

import java.util.Base64;
import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.CustomerDto;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceAttachmentMailOfAcknowledgement;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminEmailManagement;
import com.tarifvergleich.electricity.model.AdminUser;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerAddress;
import com.tarifvergleich.electricity.model.ManageAdminDocument;
import com.tarifvergleich.electricity.repository.AdminEmailManagementRepository;
import com.tarifvergleich.electricity.repository.AdminUserRepository;
import com.tarifvergleich.electricity.repository.CustomerAddressRepository;
import com.tarifvergleich.electricity.repository.CustomerRepository;
import com.tarifvergleich.electricity.repository.TokenManagementRespository;
import com.tarifvergleich.electricity.service.MailService;
import com.tarifvergleich.electricity.util.EmailBodyRender;
import com.tarifvergleich.electricity.util.EmailTemplate;
import com.tarifvergleich.electricity.util.Helper;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BusinessCustomerInvitationAuthService {

	private final CustomerRepository customerRepo;
	private final AdminUserRepository adminUserRepo;
	private final Helper helper;
	private final EmailBodyRender emailRender;
	private final ApplicationEventPublisher eventPublisher;
	private final CustomerAddressRepository customerAddressRepo;
	private final AdminEmailManagementRepository adminEmailManagementRepo;
	private final MailService mailService;
	private final EmailTemplate emailTemplate;
	private final TokenManagementRespository tokenManagementRespo;

	@Value("${otp.verification-timer}")
	private int expiryMinutes;

	@Transactional
	public Map<String, Object> customerSignUp(CustomerDto customerDto) {

		if (customerDto.getEmail() == null || customerDto.getEmail().isEmpty())
			throw new InternalServerException("Email not found", HttpStatus.OK);
		if (customerDto.getPassword() == null || customerDto.getPassword().isEmpty())
			throw new InternalServerException("Password not found", HttpStatus.OK);
		if (customerDto.getUserType() == null || customerDto.getUserType().isEmpty())
			throw new InternalServerException("User type missing", HttpStatus.OK);
		if (customerDto.getFirstName() == null || customerDto.getFirstName().isEmpty()
				|| customerDto.getLastName() == null || customerDto.getLastName().isEmpty())
			throw new InternalServerException("First name or last name missing", HttpStatus.OK);
		if (customerDto.getSalutation() == null || customerDto.getSalutation().isEmpty())
			throw new InternalServerException("Salutation missing", HttpStatus.OK);
		if (customerDto.getMobileNumber() == null || customerDto.getMobileNumber().isEmpty())
			throw new InternalServerException("Mobile number missing", HttpStatus.OK);
		if (customerDto.getZip() == null || customerDto.getZip().isEmpty())
			throw new InternalServerException("Zip code missing", HttpStatus.OK);

		if (customerDto.getCity() == null || customerDto.getCity().isEmpty())
			throw new InternalServerException("City missing", HttpStatus.OK);

		if (customerDto.getStreet() == null || customerDto.getStreet().isEmpty())
			throw new InternalServerException("Street missing", HttpStatus.OK);
		if (customerDto.getHouseNumber() == null || customerDto.getHouseNumber().trim().isEmpty())
			throw new InternalServerException("House number missing", HttpStatus.OK);

		if (customerDto.getAdminId() == null || customerDto.getAdminId() <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);
		if (customerDto.getUserType().equalsIgnoreCase("BUSINESS"))
			throw new InternalServerException("Invited customer must be private user", HttpStatus.OK);


		if (!(helper.isPasswordSecure(customerDto.getPassword(), customerDto.getEmail()))) {
			throw new InternalServerException("Password not safe", HttpStatus.OK);
		}
		
		
		
		AdminUser admin = adminUserRepo.findById(customerDto.getAdminId())
				.orElseThrow(() -> new InternalServerException("Admin not found with this credential", HttpStatus.OK));

		if (customerRepo.existsByEmail(customerDto.getEmail())) {

			Customer customer = customerRepo.findByEmail(customerDto.getEmail())
					.orElseThrow(() -> new InternalServerException("Customer not found", HttpStatus.OK));

			if (customer.getIsVerified()) {

				if (!customer.getIsAcknowledged()) {
					String encodedId = Base64.getEncoder()
							.encodeToString(customer.getCustomerId().toString().getBytes());

					Map<String, Object> emailTemplate = emailRender.conscent365AdvisorBody(encodedId, customer);

					Set<ManageAdminDocument> docs = new HashSet<ManageAdminDocument>();
					if (emailTemplate.get("docs") instanceof Collection<?> rawCollection) {
						for (Object obj : rawCollection) {
							if (obj instanceof ManageAdminDocument doc) {
								docs.add(doc);
							}
						}
					}

					ServiceAttachmentMailOfAcknowledgement mailRes = new ServiceAttachmentMailOfAcknowledgement(
							customer.getEmail(), "Action Required: Confirm your Energy Selection",
							emailTemplate.get("body").toString(), customerDto.getAdminId(), docs);

					eventPublisher.publishEvent(mailRes);
				}

				return Map.of("res", true, "data",
						Map.of("id", customer.getCustomerId(), "firstName", customer.getFirstName(), "lastName",
								customer.getLastName(), "email", customer.getEmail()),
						"page", "login", "isAcknowledge", customer.getIsAcknowledged());
			}

			else {

				CustomerAddress address = customerAddressRepo
						.findAddress(customer.getCustomerId(), customerDto.getZip(), customerDto.getCity(),
								customerDto.getStreet(), customerDto.getHouseNumber())
						.orElse(null);

				if (address != null) {
					Optional.ofNullable(customer.getCustomerAddresses()).orElse(Collections.emptyList())
							.forEach(addres -> {
								addres.setIsRegisterAddress(false);
								customerAddressRepo.save(addres);
							});

					address.setIsRegisterAddress(true);
					customerAddressRepo.save(address);
				}

				customer.setFirstName(customerDto.getFirstName());
				customer.setZip(customerDto.getZip());
				customer.setCity(customerDto.getCity());
				customer.setStreet(customerDto.getStreet());
				customer.setHouseNumber(customerDto.getHouseNumber());
				customer.setLastName(customerDto.getLastName());
				customer.setPassword(customerDto.getPassword());
				customer.setTitle(customerDto.getTitle());
				customer.setSalutation(customerDto.getSalutation());
				customer.setMobileNumber(customerDto.getMobileNumber());
				customer.setUserType(customerDto.getUserType().toUpperCase());
				if (customer.getUserType().equals("BUSINESS"))
					customer.setCompanyName(customerDto.getCompanyName());

				String otp = helper.generateOtp();
				customer.setOtp(otp);
				customer.setOtpGeneratedOn(Helper.getCurrentTimeBerlin());
				String subject = "Verify Your Account - Tarifvergleich Electricity";
				Map<String, Object> emailTemplate = emailRender.verifyOtpBody(otp);
				if (customerDto.getIsVerified() == null || !customerDto.getIsVerified())
					mailService.sendMail(customer.getEmail(), subject, emailTemplate.get("body").toString());

				customerRepo.save(customer);
				return Map.of("res", true, "data", Map.of("id", customer.getCustomerId(), "firstName",
						customer.getFirstName(), "lastName", customer.getLastName(), "email", customer.getEmail()),
						"page", "verify");
			}
		}

		String otp = helper.generateOtp();

		Customer newCustomer = Customer.builder().email(customerDto.getEmail()).password(customerDto.getPassword())
				.otp(otp).otpGeneratedOn(Helper.getCurrentTimeBerlin())
				.userType(customerDto.getUserType().toUpperCase()).firstName(customerDto.getFirstName())
				.lastName(customerDto.getLastName()).title(customerDto.getTitle())
				.salutation(customerDto.getSalutation()).mobileNumber(customerDto.getMobileNumber())
				.companyName(customerDto.getUserType().toUpperCase().equals("BUSINESS") ? customerDto.getCompanyName()
						: null)
				.build();

		CustomerAddress address = CustomerAddress.builder().zip(customerDto.getZip()).city(customerDto.getCity())
				.street(customerDto.getStreet()).houseNumber(customerDto.getHouseNumber()).isRegisterAddress(true)
				.build();

		newCustomer.setZip(customerDto.getZip());
		newCustomer.setCity(customerDto.getCity());
		newCustomer.setStreet(customerDto.getStreet());
		newCustomer.setHouseNumber(customerDto.getHouseNumber());
		newCustomer.addCustomerAddress(address);

		newCustomer.setUserAdmin(admin);

		Customer savedCustomer = customerRepo.save(newCustomer);

		AdminEmailManagement emailManagement = adminEmailManagementRepo.findByCategoryCateId(1l).orElse(null);

		if (emailManagement == null) {
			String subject = "Verify Your Account - Tarifvergleich Electricity";
			String body = emailTemplate.createOtpEmailBody(savedCustomer.getFirstName(), otp);

			if (customerDto.getIsVerified() == null || !customerDto.getIsVerified())
				mailService.sendMail(savedCustomer.getEmail(), subject, body);
		} else {
			Map<String, Object> emailTemplate = emailRender.verifyOtpBody(otp);
			Set<ManageAdminDocument> docs = new HashSet<ManageAdminDocument>();
			if (emailTemplate.get("docs") instanceof Collection<?> rawCollection) {
				for (Object obj : rawCollection) {
					if (obj instanceof ManageAdminDocument doc) {
						docs.add(doc);
					}
				}
			}

			ServiceResponseEmailEvent emailContent = new ServiceResponseEmailEvent(savedCustomer.getEmail(),
					emailManagement.getTitle(), emailTemplate.get("body").toString(), docs);
			eventPublisher.publishEvent(emailContent);
		}

		return Map
				.of("res", true, "data",
						Map.of("id", savedCustomer.getCustomerId(), "firstName", savedCustomer.getFirstName(),
								"lastName", savedCustomer.getLastName(), "email", savedCustomer.getEmail()),
						"page", "verify");
	}

}
