import {
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  Inject,
  OnInit,
  PLATFORM_ID,
  AfterViewInit,
  NgZone,
} from '@angular/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

// ── reCAPTCHA v3 type ────────────────────────────────────────
// Read from window (not `declare const`) to avoid ts(2774).
// v3 has no widget — just ready() + execute() which returns a Promise<token>.
type GrecaptchaV3 = {
  ready(callback: () => void): void;
  execute(siteKey: string, options: { action: string }): Promise<string>;
};

@Component({
  selector: 'app-contact',
  imports: [
    ContactPerson,
    NeedSupport,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    FormsModule,
  ],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact implements OnInit, AfterViewInit {
  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private eRef: ElementRef,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {}

  // ── Config ───────────────────────────────────────────────────

  readonly SITE_KEY = '6LfjDPcsAAAAAAVEKyj8xhgwgEXhfZ6G6H42papE'; // ← v3 site key (different from v2!)

  // ── UI state ─────────────────────────────────────────────────

  showDropdown = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';
  fieldErrors: Record<string, string> = {};

  categories: any[] = [];
  selectedCategory: any = null;

  formData = {
    salutation: '',
    title: '',
    firstName: '',
    lastName: '',
    email: '',
    customerId: '',
    inquiry: '',
  };

  isLoggedIn = computed(() => !!this.authService.currentUser()?.user_id);

  // ── reCAPTCHA v3 getter ──────────────────────────────────────
  // Using a getter on window avoids ts(2774) completely.

  private get grecaptcha(): GrecaptchaV3 | undefined {
    return (window as any).grecaptcha as GrecaptchaV3 | undefined;
  }

  // ── Lifecycle ────────────────────────────────────────────────

  ngOnInit(): void {
    this.fetchCategories();

    if (this.isLoggedIn()) {
      this.authService.fetchCustomer();
    }

    this.authService.getCustomerData().subscribe((data) => {
      if (!data) return;


      console.log(data);
      this.formData.salutation = data.salutation || '';
      this.formData.title = data.title || '';
      this.formData.firstName = data.firstName || '';
      this.formData.lastName = data.lastName || '';
      this.formData.email = data.email || '';
      this.formData.customerId = data.id || '';
      this.cdr.detectChanges();
    });
  }

  ngAfterViewInit(): void {
    // v3 needs no widget rendered — the script loads silently in the background.
    // Nothing to do here; execute() is called on form submit instead.
  }

  // ── Dropdown ─────────────────────────────────────────────────

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  selectCategory(item: any, event: Event): void {
    event.stopPropagation();
    this.selectedCategory = item;
    this.showDropdown = false;
  }

  // ── reCAPTCHA v3 ─────────────────────────────────────────────

  // Returns a fresh token each time — v3 tokens are single-use.
  // action is a label visible in the Google reCAPTCHA dashboard.
  private getRecaptchaToken(): Promise<string> {
    return new Promise((resolve, reject) => {
      const g = this.grecaptcha;

      if (!g) {
        reject('reCAPTCHA not loaded. Please refresh the page.');
        return;
      }

      g.ready(() => {
        g.execute(this.SITE_KEY, { action: 'contact_form' })
          .then(resolve)
          .catch(() => reject('reCAPTCHA error. Please refresh the page.'));
      });
    });
  }

  // ── Validation ───────────────────────────────────────────────

  validate(): boolean {
    this.fieldErrors = {};

    if (!this.formData.salutation.trim()) {
      this.fieldErrors['salutation'] = 'Bitte Anrede eingeben';
    }
    if (!this.formData.firstName.trim()) {
      this.fieldErrors['firstName'] = 'Bitte Vorname eingeben';
    }
    if (!this.formData.lastName.trim()) {
      this.fieldErrors['lastName'] = 'Bitte Nachname eingeben';
    }
    if (!this.formData.email.trim()) {
      this.fieldErrors['email'] = 'Bitte E-Mail eingeben';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
      this.fieldErrors['email'] = 'Ungültige E-Mail-Adresse';
    }
    if (!this.selectedCategory) {
      this.fieldErrors['category'] = 'Bitte Betreff auswählen';
    }
    if (!this.formData.inquiry.trim()) {
      this.fieldErrors['inquiry'] = 'Bitte Nachricht eingeben';
    }

    // No reCAPTCHA field error needed — v3 is invisible to the user.
    // Token is fetched programmatically in submitForm().

    return Object.keys(this.fieldErrors).length === 0;
  }

  // ── API calls ────────────────────────────────────────────────

  fetchCategories(): void {
    this.http.post<any>('http://192.168.0.155:8080/fetch-contact-category', {}).subscribe({
      next: (res) => {
        this.categories = res || [];
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  // submitForm is async because getRecaptchaToken() returns a Promise
  async submitForm(): Promise<void> {
    this.successMessage = '';
    this.errorMessage = '';

    // Validate fields first before even calling reCAPTCHA
    if (!this.validate()) return;

    this.isSubmitting = true;

    let recaptchaToken: string;

    try {
      // v3: get a fresh token silently — no user interaction needed
      recaptchaToken = await this.getRecaptchaToken();
    } catch (err) {
      // reCAPTCHA script failed to load or network error
      this.ngZone.run(() => {
        this.errorMessage =
          typeof err === 'string' ? err : 'reCAPTCHA-Fehler. Bitte Seite neu laden.';
        this.isSubmitting = false;
      });
      return;
    }

    // Submit form + token to backend.
    // Backend should verify the token with Google and check score >= 0.5.
    this.http
      .post('http://192.168.0.175:8080/save-customer-contact', {
        ...this.formData,
        adminId: 1, // Assuming adminId is required; adjust as needed
        categoryId: this.selectedCategory.id,
        recaptchaToken, // backend verifies this against Google's API
      })
      .subscribe({
        next: () => {
          this.successMessage = 'Ihre Anfrage wurde erfolgreich übermittelt.';
          this.isSubmitting = false;
        },
        error: () => {
          this.errorMessage = 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
          this.isSubmitting = false;
        },
      });
  }
}
