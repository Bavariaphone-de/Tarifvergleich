package com.tarifvergleich.electricity.dto;

import com.tarifvergleich.electricity.model.CancellationServiceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigInteger;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CancellationServiceCategoryDto {
    private Long id;
    private Integer adminId;
    private String categoryName;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    @Builder
    public static class CancellationServiceCategoryResponseDto {
        private Long id;
        private String categoryName;
        private BigInteger createdOn;
        private BigInteger updatedOn;
    }

    public static CancellationServiceCategoryResponseDto mapForAdmin(CancellationServiceCategory category) {
        return CancellationServiceCategoryResponseDto.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .createdOn(category.getCreatedOn())
                .updatedOn(category.getUpdatedOn())
                .build();
    }
}
