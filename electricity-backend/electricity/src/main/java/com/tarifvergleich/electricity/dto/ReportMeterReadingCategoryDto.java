package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tarifvergleich.electricity.model.ReportMeterReadingCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReportMeterReadingCategoryDto {

	private Integer reportMeterReadingCategoryId;
	private Integer adminId;
	private String categoryName;
	private BigInteger createdOn;
	private BigInteger updatedOn;

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	@Builder
	@JsonInclude(JsonInclude.Include.NON_NULL)
	public static class ReportMeterReadingCategoryAdminResponseDto {
		private Integer reportMeterReadingCategoryId;
		private String categoryName;
		private BigInteger createdOn;
		private BigInteger updatedOn;
	}

	public static ReportMeterReadingCategoryAdminResponseDto mapForAdmin(ReportMeterReadingCategory category) {
		return ReportMeterReadingCategoryAdminResponseDto.builder()
				.reportMeterReadingCategoryId(category.getId())
				.categoryName(category.getCategoryName())
				.createdOn(category.getCreatedOn())
				.updatedOn(category.getUpdatedOn())
				.build();
	}
}
