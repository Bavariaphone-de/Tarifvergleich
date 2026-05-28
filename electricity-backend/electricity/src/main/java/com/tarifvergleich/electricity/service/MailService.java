package com.tarifvergleich.electricity.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.InputStreamSource;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.tarifvergleich.electricity.exception.InternalServerException;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MailService {
	private final JavaMailSender mailSender;

	@Value("${email.name}")
	private String sendFrom;

	@Async
	public void sendMail(String to, String subject, String body) {

		try {
			MimeMessage message = mailSender.createMimeMessage();

			MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");
			helper.setFrom(sendFrom);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body, true);

			mailSender.send(message);
		} catch (MessagingException e) {
			throw new InternalServerException("Failed to send HTML email", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Async
	public void sendMailWithAttachment(String to, String subject, String body, String localFilePath) {
		try {

			if (localFilePath == null || localFilePath.isEmpty())
				throw new InternalServerException("File path not found", HttpStatus.BAD_REQUEST);

			MimeMessage message = mailSender.createMimeMessage();

			MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

			helper.setFrom(sendFrom);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body, true);

			Path path = Paths.get(localFilePath);
			if (Files.exists(path)) {
				FileSystemResource file = new FileSystemResource(path.toFile());

				helper.addAttachment("Contract_Details.pdf", file);
			} else
				throw new InternalServerException("File path does not exits", HttpStatus.BAD_REQUEST);

			mailSender.send(message);
		} catch (MessagingException e) {
			throw new InternalServerException("Failed to send email with attachment", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Async
	public void sendMailWithAttachment(String to, String subject, String body, List<String> localFilePaths) {
		try {

			if (localFilePaths == null || localFilePaths.isEmpty())
				throw new InternalServerException("File path not found", HttpStatus.BAD_REQUEST);

			MimeMessage message = mailSender.createMimeMessage();

			MimeMessageHelper helper = new MimeMessageHelper(message, true, "utf-8");

			helper.setFrom(sendFrom);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body, true);

			for (String localFilePath : localFilePaths) {
				Path path = Paths.get(localFilePath);
				if (Files.exists(path)) {
					FileSystemResource file = new FileSystemResource(path.toFile());

					helper.addAttachment(file.getFilename(), file);
				} else
					throw new InternalServerException("File path does not exits", HttpStatus.BAD_REQUEST);
			}

			mailSender.send(message);
		} catch (MessagingException e) {
			throw new InternalServerException("Failed to send email with attachment", HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	@Async
	public void sendEmailWithBase64Attachment(String to, String body, String pdfBase64String,
			String attachmentFileName) {

		try {
			byte[] pdfBytes = Base64.getDecoder().decode(pdfBase64String);

			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setFrom(sendFrom);
			helper.setTo(to);
			helper.setSubject("Ihre unterschriebene Beratervollmacht - Tarifvergleich");

			helper.setText(body, true);

			ByteArrayResource attachmentResource = new ByteArrayResource(pdfBytes);
			helper.addAttachment(attachmentFileName, attachmentResource);

			mailSender.send(message);

		} catch (Exception e) {
			throw new RuntimeException("Error processing email transmission queues", e);
		}
	}

	@Async
	public void sendEmailWithBase64Attachment(String to, String body, String pdfBase64String, String attachmentFileName,
			List<String> localFilePaths) {

		try {
			if (localFilePaths == null || localFilePaths.isEmpty())
				throw new InternalServerException("File path not found", HttpStatus.BAD_REQUEST);
			byte[] pdfBytes = Base64.getDecoder().decode(pdfBase64String);

			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setFrom(sendFrom);
			helper.setTo(to);
			helper.setSubject("Ihre unterschriebene Beratervollmacht - Tarifvergleich");

			helper.setText(body, true);

			ByteArrayResource attachmentResource = new ByteArrayResource(pdfBytes);
			helper.addAttachment(attachmentFileName, attachmentResource);

			for (String localFilePath : localFilePaths) {
				Path path = Paths.get(localFilePath);
				if (Files.exists(path)) {
					FileSystemResource file = new FileSystemResource(path.toFile());

					helper.addAttachment(file.getFilename(), file);
				} else
					throw new InternalServerException("File path does not exits", HttpStatus.BAD_REQUEST);
			}

			mailSender.send(message);

		} catch (Exception e) {
			throw new RuntimeException("Error processing email transmission queues", e);
		}
	}

	@Async
	public void sendEmailWithMultipartAttachment(String to, String subject, String body, List<String> absoluteFilePaths,
			List<MultipartFile> multipartFiles) {
		try {
			MimeMessage message = mailSender.createMimeMessage();

			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(body, true);

			if (multipartFiles != null && !multipartFiles.isEmpty()) {

				multipartFiles.stream().forEach(file -> {

					InputStreamSource attachmentSource = () -> file.getInputStream();
					try {
						helper.addAttachment(file.getOriginalFilename(), attachmentSource, file.getContentType());
					} catch (MessagingException e) {
						e.printStackTrace();
						throw new RuntimeException("Failed to send email with multipart attachment", e);
					}
				});
			}

			if (absoluteFilePaths != null && !absoluteFilePaths.isEmpty()) {
				for (String localFilePath : absoluteFilePaths) {
					Path path = Paths.get(localFilePath);
					if (Files.exists(path)) {
						FileSystemResource file = new FileSystemResource(path.toFile());

						helper.addAttachment(file.getFilename(), file);
					} else
						throw new InternalServerException("File path does not exits", HttpStatus.BAD_REQUEST);
				}
			}

			mailSender.send(message);

		} catch (MessagingException e) {
			throw new RuntimeException("Failed to send email with multipart attachment", e);
		}
	}
}
