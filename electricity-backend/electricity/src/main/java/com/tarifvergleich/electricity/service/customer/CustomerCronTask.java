package com.tarifvergleich.electricity.service.customer;

import java.math.BigInteger;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Executor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerDelivery;
import com.tarifvergleich.electricity.repository.CustomerDeliveryRepository;
import com.tarifvergleich.electricity.repository.CustomerOrderRepository;
import com.tarifvergleich.electricity.util.EmailTemplate;
import com.tarifvergleich.electricity.util.Helper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor(onConstructor_ = @Autowired)
public class CustomerCronTask {

	private final CustomerDeliveryRepository customerDeliveryRepo;
	private final Helper helper;
	private final ApplicationEventPublisher eventPublisher;
	private final EmailTemplate emailTemplate;
	private final CustomerOrderRepository customerOrderRepo;
	private final CustomerCronOrderService customerCronOrderService;

	@Qualifier("orderStatusCronExecutor")
	private final Executor orderStatusCronExecutor;

	public Map<String, Object> sendExpiryNotification() {

		BigInteger getExpiryDuration = helper.getSecondValueOfDuration(0, 4, 0, 0, 0, 0);

		List<CustomerDelivery> deliveries = customerDeliveryRepo.findRecentExpiryDelivery(false,
				Helper.getCurrentTimeBerlin(), getExpiryDuration);

		deliveries.forEach(delivery -> {

			Customer customer = delivery.getCustomerId();

			if (customer.getIsNotificationEnabled() && delivery.getNotificationEnabled()) {

				Map<String, Object> dateTimeMap = Helper.getLocalDateTimeFromBigInteger(delivery.getExpiryOn());

				String formattedDateTime = dateTimeMap.get("monthName").toString() + " "
						+ dateTimeMap.get("date").toString() + " " + dateTimeMap.get("year").toString() + ", at "
						+ dateTimeMap.get("hour").toString() + ":" + dateTimeMap.get("minute").toString() + " "
						+ dateTimeMap.get("amPm").toString();

				String emailBody = emailTemplate.createBookingExpiryEmailBody(delivery.getSalutation(),
						delivery.getLastName(), delivery.getFirstName(),
						delivery.getCustomerProvider().getProviderName(), formattedDateTime);

				ServiceResponseEmailEvent mailResp = new ServiceResponseEmailEvent(customer.getEmail(),
						"Handlungsbedarf: Ihr Tarif bei " + delivery.getCustomerProvider().getProviderName()
								+ " endet in Kürze",
						emailBody);

				eventPublisher.publishEvent(mailResp);
			}

		});

		return Map.of("res", true, "message", "Notification send successfully to customer");
	}

	@Scheduled(cron = "${app.order-status-check.cron-expression}", zone = "Europe/Berlin")
	public void checkOrderStatus() {

		List<Integer> orderIds = customerOrderRepo.findIdsByAdminPlacedOrderAndIsExpiredAndIsCancelled(true, false,
				false);

		if (orderIds.isEmpty())
			return;

		orderIds.forEach(id -> customerCronOrderService.checkStatusAndSendMail(id));
	}

}
