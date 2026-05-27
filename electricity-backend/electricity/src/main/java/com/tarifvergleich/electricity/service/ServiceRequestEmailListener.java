package com.tarifvergleich.electricity.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceAttachmentMailOfAcknowledgement;
import com.tarifvergleich.electricity.dto.ServiceRequestEmailEvent.ServiceResponseEmailEvent;
import com.tarifvergleich.electricity.dto.email.AttornyEmailDto;
import com.tarifvergleich.electricity.dto.email.ContractMailDto;
import com.tarifvergleich.electricity.dto.email.VerifyOtpEmail;
import com.tarifvergleich.electricity.model.ManageAdminDocument;
import com.tarifvergleich.electricity.repository.ManageAdminDocumentRepository;
import com.tarifvergleich.electricity.util.FileServiceSuperAdmin;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ServiceRequestEmailListener {

	private final MailService mailService;
	private final ManageAdminDocumentRepository adminDocumentRepo;
	private final FileServiceSuperAdmin fileServiceSuperAdmin;

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleServiceRequestEmail(ServiceRequestEmailEvent event) {
		mailService.sendMail(event.customerMail(), event.customerSub(), event.customerBody());
		mailService.sendMail(event.adminMail(), event.adminSub(), event.adminBody());
	}

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleServiceResponseEmail(ServiceResponseEmailEvent event) {
		String emailContent = event.customerBody();
		mailService.sendMail(event.customerMail(), event.customerSub(), emailContent);
	}

	@Async
	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void handleServiceAttrachmentForAcknowlegment(ServiceAttachmentMailOfAcknowledgement event) {

		List<ManageAdminDocument> adminDocPrivacy = adminDocumentRepo
				.findAllByAdminAdminIdAndDocumentCategoryLike(event.adminId(), "%PRIVACY%");
		List<ManageAdminDocument> adminDocsTerms = adminDocumentRepo
				.findAllByAdminAdminIdAndDocumentCategoryLike(event.adminId(), "%TERM%CONDITION%");

		List<String> fileUrls = new ArrayList<>();
		fileUrls.addAll(adminDocPrivacy.stream().map(e -> e.getFilePath()).map(fileServiceSuperAdmin::getAbsolutePath)
				.toList());
		fileUrls.addAll(
				adminDocsTerms.stream().map(e -> e.getFilePath()).map(fileServiceSuperAdmin::getAbsolutePath).toList());

		mailService.sendMailWithAttachment(event.customerMail(), event.customerSub(), event.custmerBody(), fileUrls);
	}

	@EventListener
	public void sendverifyEmail(VerifyOtpEmail verifyEmail) {

		if (TransactionSynchronizationManager.isActualTransactionActive()) {

			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					System.err.println("Hello from transaction");
					mailService.sendMail(verifyEmail.to(), verifyEmail.subject(), verifyEmail.body());
				}
			});
		} else {
			System.err.println("Hello from non-transaction");
			mailService.sendMail(verifyEmail.to(), verifyEmail.subject(), verifyEmail.body());
		}
	}

	@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
	public void sendPowerOfAttorny(AttornyEmailDto attornyEmailDto) {
		mailService.sendEmailWithBase64Attachment(attornyEmailDto.to(), attornyEmailDto.body(),
				attornyEmailDto.base64pdf(), attornyEmailDto.pdfName());
	}

	@EventListener
	public void sendContractMail(ContractMailDto contractMail) {

		if (TransactionSynchronizationManager.isActualTransactionActive()) {

			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					mailService.sendMailWithAttachment(contractMail.to(), contractMail.subject(), contractMail.body(),
							contractMail.absolutePath());
				}
			});
		} else {
			mailService.sendMailWithAttachment(contractMail.to(), contractMail.subject(), contractMail.body(),
					contractMail.absolutePath());
		}
	}
}
