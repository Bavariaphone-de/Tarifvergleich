package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.CancellationServiceCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CancellationServiceCategoryDto {

	private Long cancellationServiceCategoryId;
	private Integer adminId;
	private String categoryName;
	private BigInteger createdOn;
	private BigInteger updatedOn;

	@Data
	@AllArgsConstructor
	@NoArgsConstructor
	@Builder
	public static class CancellationServiceCategoryAdminResponseDto {
		private Long cancellationServiceCategoryId;
		private String categoryName;
		private BigInteger createdOn;
		private BigInteger updatedOn;
	}

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
		return CancellationServiceCategoryResponseDto.builder().id(category.getId())
				.categoryName(category.getCategoryName()).createdOn(category.getCreatedOn())
				.updatedOn(category.getUpdatedOn()).build();
	}
	
	public static CancellationServiceCategoryAdminResponseDto mapForAdminRes(CancellationServiceCategory category) {
		return CancellationServiceCategoryAdminResponseDto.builder().cancellationServiceCategoryId(category.getId())
				.categoryName(category.getCategoryName()).createdOn(category.getCreatedOn())
				.updatedOn(category.getUpdatedOn()).build();
	}

}
