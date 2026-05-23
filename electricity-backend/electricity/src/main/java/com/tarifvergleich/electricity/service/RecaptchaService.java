//package com.tarifvergleich.electricity.service;
//
//import com.tarifvergleich.electricity.dto.RecaptchaVerifyResponse;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.stereotype.Service;
//import org.springframework.util.LinkedMultiValueMap;
//import org.springframework.util.MultiValueMap;
//import org.springframework.web.client.RestTemplate;
//import jakarta.annotation.PostConstruct;
//
//@Service
//public class RecaptchaService {
//
//    @Value("${api.geoapify.secret-key}")
//    private String secretKey;
//
//    @PostConstruct
//    public void init() {
//        System.out.println("RECAPTCHA SECRET KEY = " + secretKey);
//    }
//    
//    @Value("${api.geoapify.min-score:0.5}")
//    private float minScore;
//
//    private static final String VERIFY_URL =
//        "https://www.google.com/recaptcha/api/siteverify";
//
//    private final RestTemplate restTemplate = new RestTemplate();
//
//    public boolean verify(String token) {
//        if (token == null || token.isBlank()) {
//            return false;
//        }
//
//        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
//        body.add("secret",   secretKey);
//        body.add("response", token);
//
//        try {
//            RecaptchaVerifyResponse response = restTemplate.postForObject(
//                VERIFY_URL, body, RecaptchaVerifyResponse.class
//            );
//
//            if (response == null) return false;
//
//            System.out.println("[reCAPTCHA] success=" + response.isSuccess()
//                + " score=" + response.getScore()
//                + " action=" + response.getAction());
//
//            return response.isSuccess() && response.getScore() >= minScore;
//
//        } catch (Exception e) {
//            System.err.println("[reCAPTCHA] Verification error: " + e.getMessage());
//            return false;
//        }
//    }
//}
