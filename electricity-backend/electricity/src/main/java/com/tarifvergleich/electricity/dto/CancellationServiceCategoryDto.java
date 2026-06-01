package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tarifvergleich.electricity.model.CancellationServiceCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CancellationServiceCategoryDto {

	private Integer cancellationServiceCategoryId;
	private Integer adminId;
	private String categoryName;
	private BigInteger createdOn;
	private BigInteger updatedOn;

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	@Builder
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public static class CancellationServiceCategoryAdminResponseDto {
		private Integer cancellationServiceCategoryId;
		private String categoryName;
		private BigInteger createdOn;
		private BigInteger updatedOn;
	}

	public static CancellationServiceCategoryAdminResponseDto mapForAdmin(CancellationServiceCategory category) {
		return CancellationServiceCategoryAdminResponseDto.builder()
				.cancellationServiceCategoryId(category.getId())
				.categoryName(category.getCategoryName())
				.createdOn(category.getCreatedOn())
				.updatedOn(category.getUpdatedOn())
				.build();
	}
}
