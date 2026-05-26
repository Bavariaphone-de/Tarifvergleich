package com.tarifvergleich.electricity.dto;

import java.math.BigInteger;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import com.tarifvergleich.electricity.dto.AdminEmailRequestCategoryDto.AdminEmailRequestCategoryAdminResponseDto;
import com.tarifvergleich.electricity.dto.ManageAdminDocumentDto.ManageAdminDocumentResDto;
import com.tarifvergleich.electricity.model.AdminEmailManagement;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AdminEmailRequestDto {
	
	private String title;
	private String subtitle;
	private String emailContent;
	private String createdBy;

	private BigInteger createdDate; 
	private Long cateId;
	private Integer adminId;
	private List<Long> pdfIds;

	@NoArgsConstructor
	@AllArgsConstructor
	@Builder
	@Data
	public static class AdminEmailResponseDto {
		
		private Long id;
		private Long cateId;
		private String title;
		private String subtitle;
		private String emailContent;
		private BigInteger createdDate; 

		private AdminEmailRequestCategoryAdminResponseDto category;
		private List<ManageAdminDocumentResDto> documents;
	}

	public static AdminEmailResponseDto mapResponseForAdmin(AdminEmailManagement management) {
		if (management == null)
			return null;

		return AdminEmailResponseDto.builder().id(management.getId()).title(management.getTitle()).subtitle(management.getSubtitle())
				.emailContent(management.getEmailContent()).createdDate(management.getCreatedDate())
				.cateId(
						management.getCategory() != null
				            ? management.getCategory().getCateId()
				            : null
				    )
				.documents(Optional.ofNullable(management.getDocuments()).orElseGet(Collections::emptySet).stream()
						.map(ManageAdminDocumentDto::mapForAdmin).toList())
				.build();
	}
}