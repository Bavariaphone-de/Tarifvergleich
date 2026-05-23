package com.tarifvergleich.electricity.controller.admin;

import com.tarifvergleich.electricity.model.AdminStaticContent;
import com.tarifvergleich.electricity.service.admin.AdminStaticContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/static-content")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaticContentFrontendController {

    private final AdminStaticContentService adminStaticContentService;

    @PostMapping("/all")
    public ResponseEntity<List<AdminStaticContent>> getAllContent() {

        return ResponseEntity.ok(
                adminStaticContentService.getAllContent()
        );
    }
}