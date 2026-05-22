package com.tarifvergleich.electricity.util;

import org.springframework.stereotype.Component;

@Component
public class CustomEmailTemplate {

	public String generateEmailHtml(String title, String subtitle, String emailContent) {
		// Look mom, normal CSS percentages! No escaping needed.
		String htmlTemplate = """
				<div class="mail-wrapper" style="width: 100%; max-width: 760px; margin: 0 auto; background-color: #ffffff; border: 1px solid #dcdcdc; font-family: Arial, sans-serif;">

				  <!-- TOP HEADER -->
				  <table width="100%" border="0" cellspacing="0" cellpadding="20" style="width: 100%;">
				    <tr>
				      <td align="left" valign="middle">
				        <img src="https://tarifvergleich.bayern/assets/icons/Logo.png" alt="logo" height="100" style="height: 100px; display: block;" />
				      </td>
				    </tr>
				  </table>

				  <!-- ORANGE CONTACT BAR -->
				  <table width="95%" border="0" cellspacing="0" cellpadding="12" bgcolor="#fc770a" style="background-color: #fc770a; border-radius: 8px; margin: 0 auto; width: 95%;">
				    <tr>
				      <td width="60" valign="middle" style="width: 60px;">
				        <img src="https://tarifvergleich.bayern/assets/images/MM.png" alt="advisor" width="60" height="60" style="width: 60px; height: 60px; border-radius: 50%; display: block;" />
				      </td>
				      <td valign="middle" style="color: #000000; font-size: 14px; font-family: Arial, sans-serif;">
				        <div style="font-size: 14px; color: #000000;">Ihr persönlicher Ansprechpartner</div>
				        <div style="font-size: 14px; font-weight: bold; color: #000000;">Manuel Markovic</div>
				        <div style="font-size: 16px; margin-top: 4px; color: #000000;">
				          <strong>08157 999 42-0 </strong> <span style="font-size: 13px;">(Mo. - Sa. 8:00 - 20:00 Uhr)</span>
				        </div>
				      </td>
				    </tr>
				  </table>

				  <!-- TITLE & CONTENT -->
				  <table width="100%" border="0" cellspacing="0" cellpadding="20" style="width: 100%;">
				    <tr>
				      <td style="font-family: Arial, sans-serif;">
				        <h1 style="font-size: 36px; margin: 0 0 10px 0; color: #222222; font-weight: bold; font-family: Arial, sans-serif;">{{title}}</h1>

				        <div style="font-size: 15px; color: #444444; line-height: 1.7; font-family: Arial, sans-serif;">
				          <h3 style="font-size: 18px; margin: 0 0 15px 0; color: #222222; font-family: Arial, sans-serif;">{{subtitle}}</h3>
				          <div>{{content}}</div>
				        </div>
				      </td>
				    </tr>
				  </table>

				  <!-- ORANGE TITLE -->
				  <table width="95%" border="0" cellspacing="0" cellpadding="12" bgcolor="#fc770a" style="background-color: #fc770a; border-radius: 8px; margin: 0 auto; width: 95%;">
				    <tr>
				      <td style="color: #ffffff; font-size: 30px; font-weight: 600; padding: 10px 16px; font-family: Arial, sans-serif;">
				        Ich bin für Sie da
				      </td>
				    </tr>
				  </table>

				  <!-- ADVISOR SECTION -->
				  <table width="100%" border="0" cellspacing="0" cellpadding="20" style="width: 100%;">
				    <tr>
				      <!-- Advisor Left Sidebar -->
				      <td width="260" valign="top" style="width: 260px;">
				        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="text-align: center; width: 100%;">
				          <tr>
				            <td align="center" style="padding-top: 12px;">
				              <img src="https://tarifvergleich.bayern/assets/images/MM.png" alt="Familienbetrieb" width="130" style="border-radius: 8px; width: 130px; display: block; margin: 0 auto;" />
				            </td>
				          </tr>
				          <tr>
				            <td style="padding: 9px 10px 10px 10px; font-weight: 700; font-size: 16px; color: #222222; font-family: Arial, sans-serif;">
				              Manuel Markovic
				            </td>
				          </tr>
				          <!-- Call Button -->
				          <tr>
				            <td align="center" style="padding-bottom: 8px;">
				              <table border="0" cellspacing="0" cellpadding="0">
				                <tr>
				                  <td bgcolor="#fc770a" style="background-color: #fc770a; border-radius: 8px; padding: 6px 12px;">
				                    <a href="tel:08157999420" style="text-decoration: none; color: #ffffff; font-weight: 500; font-size: 14px; display: inline-block; font-family: Arial, sans-serif;">
				                      <img src="https://tarifvergleich.bayern/assets/icons/Telefonh%C3%B6rer_Weiss.png" alt="telephone" width="20" height="20" style="vertical-align: middle; width: 20px; height: 20px; margin-right: 5px; display: inline-block;" />
				                      08157 / 999 42-0
				                    </a>
				                  </td>
				                </tr>
				              </table>
				            </td>
				          </tr>
				          <!-- Email Button -->
				          <tr>
				            <td align="center">
				              <table border="0" cellspacing="0" cellpadding="0">
				                <tr>
				                  <td bgcolor="#fc770a" style="background-color: #fc770a; border-radius: 8px; padding: 6px 12px;">
				                    <a href="mailto:mm@energiehandel.bayern" style="text-decoration: none; color: #ffffff; font-weight: 500; font-size: 14px; display: inline-block; font-family: Arial, sans-serif;">
				                      <img src="https://tarifvergleich.bayern/assets/icons/Mail.png" alt="email" width="20" height="20" style="vertical-align: middle; width: 20px; height: 20px; margin-right: 5px; display: inline-block;" />
				                      mm@energiehandel.bayern
				                    </a>
				                  </td>
				                </tr>
				              </table>
				            </td>
				          </tr>
				        </table>
				      </td>

				      <!-- Advisor Right Text Content -->
				      <td valign="top" style="font-size: 15px; line-height: 1.7; color: #444444; padding-left: 10px; font-family: Arial, sans-serif;">
				        <p style="margin: 0 0 12px 0;">Haben Sie noch Fragen zur Passwortänderung?</p>
				        <p style="margin: 0 0 12px 0;">Als Ihr persönlicher Ansprechpartner stehe ich Ihnen sehr gerne zur Verfügung.</p>
				        <p style="margin: 0 0 12px 0;">Bitte nennen Sie bei der Beratung immer Ihre E-Mail-Adresse <strong>m.mail@mustermann.de</strong></p>
				        <p style="margin: 0 0 12px 0;">Sie erreichen mich von Montag bis Samstag zwischen <strong>08:00 und 20:00 Uhr</strong> unter den nebenstehenden Kontaktdaten.</p>
				        <p style="margin: 0 0 12px 0;">Herzliche Grüße aus Bayern</p>
				        <p style="margin: 0;">Manuel Markovic <br /><span style="color: #777777; font-size: 14px;">Ihr persönlicher Kundenberater</span></p>
				      </td>
				    </tr>
				  </table>

				  <!-- FOOTER NAVIGATION -->
				  <table width="100%" border="0" cellspacing="0" cellpadding="12" bgcolor="#003b79" style="background-color: #003b79; text-align: center; width: 100%;">
				    <tr>
				      <td style="color: #ffffff; font-size: 14px; font-weight: 600; font-family: Arial, sans-serif;">
				        <span style="padding: 0 15px; display: inline-block;">Impressum</span>
				        <span style="padding: 0 15px; display: inline-block;">Contact</span>
				        <span style="padding: 0 15px; display: inline-block;">Datenschutz</span>
				        <span style="padding: 0 15px; display: inline-block;">AGB</span>
				      </td>
				    </tr>
				  </table>

				  <!-- FOOTER BOTTOM DISCLAIMER -->
				  <table width="100%" border="0" cellspacing="0" cellpadding="18" bgcolor="#4a4a4a" style="background-color: #4a4a4a; text-align: center; width: 100%;">
				    <tr>
				      <td style="color: #dddddd; font-size: 13px; line-height: 1.5; font-family: Arial, sans-serif;">
				        © 2026 - Tarifvergleich.Bayern. Das Vergleichsportal. Hier können
				        Verbraucherinnen und Verbraucher kostenlos Tarife und Produkte in dem
				        Bereich Energie (Strom und Gas) vergleichen. Tarifvergleich.Bayern legt
				        größte Sorgfalt auf Vollständigkeit und Richtigkeit der dargestellten
				        Informationen, übernimmt aber keine Gewähr für diese oder die
				        Leistungsfähigkeit der Anbieter.
				      </td>
				    </tr>
				  </table>

				</div>
				""";

		return htmlTemplate.replace("{{title}}", title != null ? title : "")
				.replace("{{subtitle}}", subtitle != null ? subtitle : "")
				.replace("{{content}}", emailContent != null ? emailContent : "");
	}
}