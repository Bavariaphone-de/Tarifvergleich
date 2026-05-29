package com.tarifvergleich.electricity.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigInteger;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerChangeDiscountRequestDto {

    private Integer id;

    private Integer customerId;

    private Integer deliveryId;

    private Integer orderId;

    private String newAdvanceAmount;

    private String reason;

    private Integer status;

    private BigInteger createdOn;
}