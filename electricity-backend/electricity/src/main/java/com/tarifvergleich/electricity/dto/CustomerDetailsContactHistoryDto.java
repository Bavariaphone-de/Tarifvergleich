package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.CustomerDetailsContactHistory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data

public class CustomerDetailsContactHistoryDto {

    private Integer contactHistoryId;
    private String note;
    private BigInteger addedOn;
    private Integer customerId;
    private Integer adminId;

    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    @Data

    public static class CustomerDetailsContactHistoryResponseDto {

        private Integer contactHistoryId;
        private String note;
        private BigInteger addedOn;

    }

    public static CustomerDetailsContactHistoryResponseDto
    mapContactHistoryResponse( CustomerDetailsContactHistory contactHistory ) {

        if (contactHistory == null) return null;

        return CustomerDetailsContactHistoryResponseDto
                .builder()
                .contactHistoryId(contactHistory.getId())
                .note(contactHistory.getNote())
                .addedOn(contactHistory.getAddedOn())
                .build();

    }

}