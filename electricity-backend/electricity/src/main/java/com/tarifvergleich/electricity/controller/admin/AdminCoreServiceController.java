package com.tarifvergleich.electricity.controller.admin;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tarifvergleich.electricity.service.admin.AdminCoreService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/admin/api")
@CrossOrigin(origins = "*")
public class AdminCoreServiceController {

	private final AdminCoreService adminCoreService;
	
//	@PostMapping("")
}
