package com.tarifvergleich.electricity.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

	
	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("/assets/**")
				.addResourceLocations("file:../../assets/");
		
		registry.addResourceHandler("/static-content/**")
				.addResourceLocations("file:static-content/");
		
		registry.addResourceHandler("/assets/**")
		.addResourceLocations("/file:customer-signed-documents/");
	}
	
}
