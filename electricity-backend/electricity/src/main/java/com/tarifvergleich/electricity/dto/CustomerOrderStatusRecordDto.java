package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.CustomerOrder;
import com.tarifvergleich.electricity.model.CustomerOrderStatusRecord;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class CustomerOrderStatusRecordDto {
	private Long id;
	private Integer status;
	private String message;
	private BigInteger checkedOn;
	private Integer customerOrderId;

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class CustomerOrderStatusRecordForDeliveryDetailsAdmin {
		private Integer status;
		private String message;
		private BigInteger checkedOn;
		private String orderState;
	}

	public static CustomerOrderStatusRecordForDeliveryDetailsAdmin mapForCustomerDeliveryDetails(CustomerOrder order) {
		if (order == null)
			return CustomerOrderStatusRecordForDeliveryDetailsAdmin.builder().orderState("Pending").build();

		CustomerOrderStatusRecord lastRecord = order.getCustomerOrderStatusRecords() != null
				&& !order.getCustomerOrderStatusRecords().isEmpty() ? order.getCustomerOrderStatusRecords().getLast()
						: null;
		if (lastRecord != null)
			return CustomerOrderStatusRecordForDeliveryDetailsAdmin.builder().status(lastRecord.getStatus())
					.message(lastRecord.getMessage()).checkedOn(lastRecord.getCheckedOn())
					.orderState(CustomerOrderStatusRecordDto.checkOrderState(order)).build();
		else
			return CustomerOrderStatusRecordForDeliveryDetailsAdmin.builder()
					.orderState(CustomerOrderStatusRecordDto.checkOrderState(order)).build();
	}

	public static String checkOrderState(CustomerOrder order) {
		if (order.getDelivery().getIsExpired())
			return "Expired";
		if (order.getOrderStatus().equals(1) && !order.getAdminPlacedOrder())
			return "Open Order";
		if (order.getCustomerBookingDocument() != null
				&& order.getCustomerBookingDocument().getSignedDocumentSubmitted() != null
				&& order.getCustomerBookingDocument().getSignedDocumentSubmitted())
			return "Document Uploaded";
		if (order.getAdminPlacedOrder() && order.getOrderId() != null && order.getCustomerContractSignature() == null)
			return "Incomplete";
		if (order.getAdminPlacedOrder() && order.getOrderId() != null)
			return "Order Created";
		if (!order.getAdminPlacedOrder() && order.getOrderId() == null)
			return "Open Order";
		return "Unknown";

	}

}
