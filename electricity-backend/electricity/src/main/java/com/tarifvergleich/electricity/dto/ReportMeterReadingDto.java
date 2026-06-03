package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;
import java.time.LocalDateTime;

import com.tarifvergleich.electricity.dto.CustomerDeliveryResponseDto.CustomerDeliveryProfileDetail;
import com.tarifvergleich.electricity.model.Customer;
import com.tarifvergleich.electricity.model.CustomerOrder;
import com.tarifvergleich.electricity.model.ReportMeterReading;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Data
@Getter
@Setter
public class ReportMeterReadingDto {

	private Integer customerId;
	
	private String salutation;
	
	private String customerName;
	
	private String customerEmail;
	
	private Long bookingId;
	
	private Integer bookingStatus;
	
	private BigInteger bookingCreatedOn;
	
    private Integer deliveryId;

    private Integer orderId;
    
    private Integer adminId;
    
    private String imagePath;

	private Integer connectionId;

	private String category;

	private String readingDate;

	private String meterReading;

	private Integer id;

    private LocalDateTime createdAt;
    
    private Integer status;
    
    
    @Data
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReportMeterReadingResponseForAdminDto {
    	private Integer customerId;	
    	private String salutation;
    	private String customerName;   	
    	private String customerEmail;   	
    	private Long bookingId;  	
    	private Integer bookingStatus;  	
    	private BigInteger bookingCreatedOn;
    	private Boolean isExpired;
    	private Boolean adminPlacedOrder;
    	private String signedFileUrl;
    	private Long bookingOrderId;
        private CustomerDeliveryProfileDetail deliveryId;
        private Integer orderId;
        private Integer adminId;
        private Integer connectionId;
        private String category;
        private String readingDate;
        private String meterReading;
        private Integer id;
        private String imagePath;
        private Integer status;
        private LocalDateTime createdAt;
    }
    
    public static ReportMeterReadingResponseForAdminDto mapForAdminResponse(ReportMeterReading entity, CustomerOrder order) {
    	if(entity == null) return null;
    	
    	ReportMeterReadingResponseForAdminDto dto = new ReportMeterReadingResponseForAdminDto();

        dto.setId(entity.getId());
        Customer customer = entity.getCustomer();

        if(customer != null) {
            dto.setCustomerName(
                customer.getFirstName() + " " + customer.getLastName()
            );
            dto.setCustomerEmail(
            	customer.getEmail()
            );
            dto.setSalutation(
            	customer.getSalutation()
            );
        }     

        if(order != null){

            dto.setBookingId(order.getOrderId());

            dto.setBookingStatus(order.getOrderStatus());

            dto.setBookingCreatedOn(order.getCreatedOn());

            dto.setIsExpired(order.getIsExpired());

            dto.setAdminPlacedOrder(order.getAdminPlacedOrder());

            dto.setBookingOrderId(order.getOrderId());

            if(order.getCustomerBookingDocument() != null){
                dto.setSignedFileUrl(
                    order.getCustomerBookingDocument().getSignedFileUrl()
                );
            }
        }
        
        if(order != null){
            dto.setDeliveryId(
                CustomerDeliveryResponseDto.getDeliveryResponseForProfile(
                    order.getDelivery()
                )
            );
        }
        
        dto.setOrderId(entity.getOrderId());
        dto.setConnectionId(entity.getConnectionId());
        dto.setCategory(entity.getCategory().getCategoryName());
        dto.setReadingDate(entity.getReadingDate());
        dto.setMeterReading(entity.getMeterReading());
        dto.setImagePath(entity.getImagePath());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());

    	return dto;
    }
}