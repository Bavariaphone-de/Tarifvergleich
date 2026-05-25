package com.tarifvergleich.electricity.util;

import java.io.ByteArrayOutputStream;
import java.util.Base64;

import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import com.tarifvergleich.electricity.model.CustomerAttorny;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class PdfGenerator {

	private final TemplateEngine templateEngine;

	public String generateVollmachtDocument(CustomerAttorny customerAttorny) {

		try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

			Context context = new Context();
			context.setVariable("customerAttorny", customerAttorny);

			String compiledHtml = templateEngine.process("vollmacht-template", context);

			PdfRendererBuilder builder = new PdfRendererBuilder();
			builder.useFastMode();
			builder.withHtmlContent(compiledHtml, null);
			builder.toStream(outputStream);
			builder.run();

			byte[] pdfContent = outputStream.toByteArray();
			return Base64.getEncoder().encodeToString(pdfContent);

		} catch (Exception e) {
			throw new RuntimeException("Error processing authority verification documents context layers", e);
		}
	}
}
