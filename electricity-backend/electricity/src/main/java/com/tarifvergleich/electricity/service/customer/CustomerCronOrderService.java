package com.tarifvergleich.electricity.service.customer;

import java.math.BigInteger;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import com.tarifvergleich.electricity.dto.EgonOrderStatusResponse;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerDelivery;
import com.tarifvergleich.electricity.model.CustomerOrder;
import com.tarifvergleich.electricity.model.CustomerSelectedProvider;
import com.tarifvergleich.electricity.repository.CustomerOrderRepository;
import com.tarifvergleich.electricity.service.EnergyService;
import com.tarifvergleich.electricity.util.Helper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CustomerCronOrderService {

	private final ApplicationEventPublisher eventPublisher;
	private final CustomerOrderRepository customerOrderRepo;
	private final Helper helper;
	private final EnergyService energyService;

	@Async("orderStatusCronExecutor")
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public void checkStatusAndSendMail(Integer customerOrderId) {

		if (customerOrderId == null || customerOrderId <= 0)
			return;

		CustomerOrder order = customerOrderRepo.findById(customerOrderId).orElse(null);

		if (order == null)
			return;

		if (order.getIsExpired() || order.getIsCancelled())
			return;

		EgonOrderStatusResponse egonStatusResponse = energyService.checkOrderStatus(order.getOrderId().toString());

		if (!egonStatusResponse.status().equals(2000))
			return;

		CustomerDelivery delivery = order.getDelivery();

		CustomerSelectedProvider provider = delivery.getCustomerProvider();

		Customer customer = order.getCustomer();

		LocalDate expiry;
		BigInteger totalTerm;

		try {
			expiry = helper.flexibleDateParser(provider.getRaw().get("optTerm").asText())
					.atStartOfDay(ZoneId.of("Europe/Berlin")).minusDays(1).toLocalDate();
		} catch (DateTimeParseException | IllegalArgumentException e) {
			Long expireDuration = provider.getRaw().get("optTerm").asLong();
			expiry = LocalDate.now().atStartOfDay().atZone(ZoneId.of("Europe/Berlin")).plusMonths(expireDuration)
					.minusDays(1).toLocalDate();
		}

		totalTerm = BigInteger.valueOf(ChronoUnit.SECONDS.between(ZonedDateTime.now(ZoneId.of("Europe/Berlin")),
				expiry.atStartOfDay(ZoneId.of("Europe/Berlin"))));

		BigInteger cancelTime = BigInteger.valueOf(0);
		if (provider.getRaw().path("cancel") != null && provider.getRaw().path("cancelType") != null) {
			Integer cancel = provider.getRaw().path("cancel").asInt();
			Integer cancelType = provider.getRaw().path("cancelType").asInt();
			BigInteger expiryBigInt = helper.toGermamUnixTimestamp(expiry);

			if (cancelType.equals(0))
				cancelTime = expiryBigInt.subtract(helper.getSecondValueOfDuration(0, 0, 0, 0, 0, 0));
			else if (cancelType.equals(1))
				cancelTime = expiryBigInt.subtract(helper.getSecondValueOfDuration(0, 0, cancel, 0, 0, 0));
			else if (cancelType.equals(2))
				cancelTime = expiryBigInt.subtract(helper.getSecondValueOfDuration(0, 0, cancel * 7, 0, 0, 0));
			else if (cancelType.equals(3))
				cancelTime = expiryBigInt.subtract(helper.getSecondValueOfDuration(0, cancel, 0, 0, 0, 0));
		}

		order.setExpiryOn(helper.toGermamUnixTimestamp(expiry));
		order.setLastDateOfCancellation(cancelTime);
		order.setOperationPeriod(totalTerm);

		delivery.setExpiryOn(helper.toGermamUnixTimestamp(expiry));
		delivery.setLastDateOfCancellation(cancelTime);

		order.setDelivery(delivery);

		customerOrderRepo.save(order);

		String emailBody = "";

		ServiceResponseEmailEvent mailEvent = new ServiceResponseEmailEvent(customer.getEmail(),
				"Contract Confirmation (Contract Number: " + order.getId() + ")", emailBody);

		eventPublisher.publishEvent(mailEvent);
	}
}
