package com.tarifvergleich.electricity.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAssetDto {
	
	private Integer id;
	private Integer adminId;
	private String heading;
	private String subHeading;
	private String contact;

	private Integer order;
	private Integer type;
	private String saving;
	
	private String savingDetail;
	private String popupContent2;
	private String popupContent3;
	
	private String contactName;
	private String contactEmail;

	@Data
	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	public static class AdminAssetSuffleDto{
		private Integer adminId;
		private List<AdminAssetDto> menu;
	}
}
