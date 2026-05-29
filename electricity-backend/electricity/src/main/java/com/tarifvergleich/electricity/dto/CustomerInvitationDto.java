package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class CustomerInvitationDto {

	private Integer customerInvitationId;
	private Integer customerId;
	private Integer status;
	private String sendToEmail;
	private BigInteger sendOn;
	private Integer adminId;
}
