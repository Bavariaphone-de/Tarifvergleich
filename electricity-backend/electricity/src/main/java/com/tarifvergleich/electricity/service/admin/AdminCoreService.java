package com.tarifvergleich.electricity.service.admin;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.tarifvergleich.electricity.dto.AdminSignatureDto;
import com.tarifvergleich.electricity.dto.AdminSignatureDto.AdminSignatureResponseDto;
import com.tarifvergleich.electricity.exception.InternalServerException;
import com.tarifvergleich.electricity.model.AdminSignature;
import com.tarifvergleich.electricity.model.AdminUser;
import com.tarifvergleich.electricity.repository.AdminUserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminCoreService {

	private final AdminUserRepository adminUserRepo;

	public Map<String, Object> fetchAdminSignature(Integer adminId) {
		if (adminId == null || adminId <= 0)
			throw new InternalServerException("Admin id missing", HttpStatus.OK);

		AdminUser admin = adminUserRepo.findById(adminId)
				.orElseThrow(() -> new InternalServerException("Admin not found with this credential", HttpStatus.OK));

		AdminSignature adminSignature = admin.getAdminSignatures();

		AdminSignatureResponseDto adminSignatureResponse = AdminSignatureDto.mapSignatureResponse(adminSignature);

		return Map.of("res", true, "data", adminSignatureResponse);
	}
}
