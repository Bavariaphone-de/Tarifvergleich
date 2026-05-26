package com.tarifvergleich.electricity.dto;

public record EgonOrderStatusResponse(Long orderId, Integer status, String statusDescription) {

}
