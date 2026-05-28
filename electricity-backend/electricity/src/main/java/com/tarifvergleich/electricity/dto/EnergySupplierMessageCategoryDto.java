package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;

import com.tarifvergleich.electricity.model.EnergySupplierMessageCategory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class EnergySupplierMessageCategoryDto {

	private Integer supplierMessageCategoryId;
	private String categoryName;
	private BigInteger createdOn;
	private BigInteger updatedOn;
	private Integer adminId;

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class EnergySupplierMessageCategoryAdminResponseDto {
		private Integer supplierMessageCategoryId;
		private String categoryName;
		private BigInteger createdOn;
		private BigInteger updatedOn;
	}

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class EnergySupplierMessageCategoryCustomerResponseDto {
		private Integer supplierMessageCategoryId;
		private String categoryName;
	}

	public static EnergySupplierMessageCategoryAdminResponseDto mapForAdmin(EnergySupplierMessageCategory category) {
		if (category == null)
			return null;

		return EnergySupplierMessageCategoryAdminResponseDto.builder().supplierMessageCategoryId(category.getId())
				.categoryName(category.getCategoryName()).createdOn(category.getCreatedOn())
				.updatedOn(category.getUpdatedOn()).build();
	}

	public static EnergySupplierMessageCategoryCustomerResponseDto mapForGeneral(
			EnergySupplierMessageCategory category) {
		if (category == null)
			return null;

		return EnergySupplierMessageCategoryCustomerResponseDto.builder().supplierMessageCategoryId(category.getId())
				.categoryName(category.getCategoryName()).build();
	}
}
