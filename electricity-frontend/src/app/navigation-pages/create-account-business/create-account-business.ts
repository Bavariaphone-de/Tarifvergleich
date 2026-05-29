import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  computed,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ContactPerson } from '../../layout/contact-person/contact-person';
import { NeedSupport } from '../../layout/need-support/need-support';
import { AuthService } from '../../services/auth.service';
import { AddressService } from '../../services/address.service';

const API_BASE = 'http://192.168.0.155:8080';

@Component({
  selector: 'app-create-business-account',
  standalone: true,
  imports: [
    ContactPerson,
    NeedSupport,
    MatDatepickerModule,
    MatNativeDateModule,
    CommonModule,
    FormsModule,
    RouterModule,
  ],
  templateUrl: './create-account-business.html',
  styleUrl: './create-account-business.css',
})
export class CreateBusinessAccount implements OnInit, OnDestroy {
  // ── Form fields ──────────────────────────────────────────────
  salutation: string = '';
  title: string = ''; // select: '' | 'Dr.' | 'Prof.' | 'Prof. Dr.'
  companyName: string = '';
  firstName: string = '';
  lastName: string = '';
  emailBusiness: string = ''; // E-Mail 1 – geschäftlich (required, readonly)
  emailPrivate: string = ''; // E-Mail 2 – privat       (optional)
  mobile: string = ''; // Handynummer  (required)  — matches customer order
  phone: string = ''; // Telefonnummer (optional) — matches customer order
  dob: Date | null = null;

  // ── Address fields ───────────────────────────────────────────
  zip: string = '';
  city: string = '';
  street: string = '';
  houseNumber: string = '';

  // ── Address dropdown state ───────────────────────────────────
  citySearch: string = '';
  streetSearch: string = '';
  showCityDropdown: boolean = false;
  showStreetDropdown: boolean = false;
  filteredCityOptions: any[] = [];
  filteredStreetOptions: any[] = [];
  isStreetLoading: boolean = false;

  // ── UI state ─────────────────────────────────────────────────
  isLoading: boolean = false;
  successMessage: string = '';
  errorMessage: string = '';
  validationErrors: Record<string, string> = {};

  // ── Datepicker bounds ────────────────────────────────────────
  readonly minDob: Date = new Date(1900, 0, 1);
  readonly maxDob: Date = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    d.setHours(23, 59, 59, 999);
    return d;
  })();

  private routerSub?: Subscription;

  isLoggedIn = computed(() => !!this.authService.currentUser()?.user_id);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private authService: AuthService,
    private addressService: AddressService,
    private cdr: ChangeDetectorRef,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.initPrefillData();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
  }

  /** Close address dropdowns when clicking outside */
  @HostListener('document:click')
  onDocumentClick(): void {
    this.showCityDropdown = false;
    this.showStreetDropdown = false;
  }

  private resetFields(): void {
    this.salutation = '';
    this.title = '';
    this.companyName = '';
    this.firstName = '';
    this.lastName = '';
    this.emailBusiness = '';
    this.emailPrivate = '';
    this.mobile = '';
    this.phone = '';
    this.dob = null;
    this.zip = '';
    this.city = '';
    this.street = '';
    this.houseNumber = '';
    this.citySearch = '';
    this.streetSearch = '';
    this.filteredCityOptions = [];
    this.filteredStreetOptions = [];
    this.validationErrors = {};
    this.successMessage = '';
    this.errorMessage = '';
  }

  private prefillForm(data: any): void {
    this.salutation = data.salutation ?? '';
    this.title = (data.title ?? '').trim();
    this.companyName = data.companyName ?? data.businessName ?? data.company ?? this.companyName;
    this.firstName = data.firstName ?? '';
    this.lastName = data.lastName ?? '';
    this.emailBusiness = data.emailBusiness ?? data.email ?? this.emailBusiness;
    this.emailPrivate = data.emailPrivate ?? '';

    // mobile = mobileNumber/mobile (required); phone = telephone/phone (optional)
    this.mobile = data.mobileNumber ?? data.mobile ?? '';
    this.phone = data.telephone ?? data.phone ?? '';

    if (data.dob) {
      const parsed = new Date(Number(data.dob) * 1000);
      if (!isNaN(parsed.getTime())) {
        this.dob = parsed;
      }
    }

    // Address
    const addr = data.address ?? {};
    this.zip = addr.zip ?? data.zip ?? '';
    this.city = addr.city ?? data.city ?? '';
    this.street = addr.street ?? data.street ?? '';
    this.houseNumber = addr.houseNumber ?? data.houseNumber ?? '';
    this.citySearch = this.city;
    this.streetSearch = this.street;

    // Pre-load street options if zip + city are already known
    if (this.zip && this.city) {
      this.addressService.getCitiesByZip(this.zip).subscribe((cities: any[]) => {
        this.filteredCityOptions = cities;
        this.addressService.getStreetsByCity(this.zip, this.city).subscribe((streets: any[]) => {
          this.filteredStreetOptions = streets;
          this.cdr.detectChanges();
        });
      });
    }

    this.cdr.detectChanges();
  }

  private initPrefillData(): void {
    this.prefillFromAuthState();
    this.prefillFromQueryParams();
    this.fetchStoredFormData();
  }

  private prefillFromAuthState(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;
    this.emailBusiness = this.emailBusiness || user.email || '';
  }

  private prefillFromQueryParams(): void {
    const params = this.route.snapshot.queryParamMap;
    this.emailBusiness = params.get('email') ?? this.emailBusiness;
    this.companyName =
      params.get('companyName') ??
      params.get('businessName') ??
      params.get('company') ??
      this.companyName;
  }

  private fetchStoredFormData(): void {
    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();
    if (!userId || !deliveryId) return;

    const payload = {
      customerId: parseInt(userId, 10),
      deliveryId: parseInt(deliveryId, 10),
      step: 0,
    };

    this.http.post<any>(`${API_BASE}/customer/fetch-form`, payload).subscribe({
      next: (res) => {
        if (res?.res === true && res.data) {
          this.prefillForm(res.data);
        }
      },
      error: () => {
        // Keep the page usable even when stored form data cannot be loaded.
      },
    });
  }

  // ── Address dropdown handlers ────────────────────────────────
  onPostalCodeInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.zip = value;
    this.city = '';
    this.street = '';
    this.citySearch = '';
    this.streetSearch = '';
    this.filteredCityOptions = [];
    this.filteredStreetOptions = [];

    if (value.length === 5) {
      this.addressService.getCitiesByZip(value).subscribe((cities: any[]) => {
        this.filteredCityOptions = cities;
        this.showCityDropdown = cities.length > 0;
        this.cdr.detectChanges();
      });
    }
  }

  onCityInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.citySearch = (event.target as HTMLInputElement).value;
    this.filteredCityOptions = this.filteredCityOptions.filter((c) =>
      c.city.toLowerCase().includes(value),
    );
    this.showCityDropdown = true;
  }

  selectCity(c: any): void {
    this.city = c.city;
    this.citySearch = c.city;
    this.showCityDropdown = false;
    this.street = '';
    this.streetSearch = '';
    this.filteredStreetOptions = [];

    this.isStreetLoading = true;
    this.addressService.getStreetsByCity(this.zip, this.city).subscribe((streets: any[]) => {
      this.filteredStreetOptions = streets;
      this.isStreetLoading = false;
      this.cdr.detectChanges();
    });
  }

  onStreetInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value.toLowerCase();
    this.streetSearch = (event.target as HTMLInputElement).value;
    this.filteredStreetOptions = this.filteredStreetOptions.filter((s) =>
      s.street.toLowerCase().includes(value),
    );
    this.showStreetDropdown = true;
  }

  selectStreet(s: any): void {
    this.street = s.street;
    this.streetSearch = s.street;
    this.showStreetDropdown = false;
  }

  // ── Validation ───────────────────────────────────────────────
  private readonly EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly PHONE_RE = /^[+\d][\d\s\-/]{6,}$/;

  private validate(): boolean {
    this.validationErrors = {};

    if (!this.salutation?.trim()) {
      this.validationErrors['salutation'] = 'Bitte wählen Sie eine Anrede aus.';
    }

    if (!this.firstName?.trim()) {
      this.validationErrors['firstName'] = 'Bitte geben Sie Ihren Vornamen ein.';
    }
    if (!this.lastName?.trim()) {
      this.validationErrors['lastName'] = 'Bitte geben Sie Ihren Nachnamen ein.';
    }

    if (!this.companyName?.trim()) {
      this.validationErrors['companyName'] = 'Bitte geben Sie den Unternehmensnamen ein.';
    }

    // E-Mail 1 – business (required)
    if (!this.emailBusiness?.trim()) {
      this.validationErrors['emailBusiness'] =
        'Bitte geben Sie Ihre geschäftliche E-Mail-Adresse ein.';
    } else if (!this.EMAIL_RE.test(this.emailBusiness.trim())) {
      this.validationErrors['emailBusiness'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    // E-Mail 2 – private (optional)
    if (this.emailPrivate?.trim() && !this.EMAIL_RE.test(this.emailPrivate.trim())) {
      this.validationErrors['emailPrivate'] = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
    }

    // Handynummer (required)
    if (!this.mobile?.trim()) {
      this.validationErrors['mobile'] = 'Bitte geben Sie Ihre Handynummer ein.';
    } else if (!this.PHONE_RE.test(this.mobile.trim())) {
      this.validationErrors['mobile'] = 'Bitte geben Sie eine gültige Handynummer ein.';
    }

    // Telefonnummer (optional)
    if (this.phone?.trim() && !this.PHONE_RE.test(this.phone.trim())) {
      this.validationErrors['phone'] = 'Bitte geben Sie eine gültige Telefonnummer ein.';
    }

    // Date of birth
    if (!this.dob) {
      this.validationErrors['dob'] = 'Bitte Geburtsdatum auswählen.';
    } else {
      const selected = new Date(this.dob);
      selected.setHours(0, 0, 0, 0);
      const minDate = new Date(1900, 0, 1);
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() - 18);
      maxDate.setHours(0, 0, 0, 0);

      if (selected < minDate) {
        this.validationErrors['dob'] = 'Bitte geben Sie ein gültiges Geburtsdatum ein.';
      } else if (selected > maxDate) {
        this.validationErrors['dob'] = 'Sie müssen mindestens 18 Jahre alt sein.';
      }
    }

    // Address
    if (!this.zip?.trim()) {
      this.validationErrors['zip'] = 'Bitte geben Sie Ihre PLZ ein.';
    } else if (!/^\d{5}$/.test(this.zip.trim())) {
      this.validationErrors['zip'] = 'Bitte geben Sie eine gültige PLZ ein (5 Ziffern).';
    }

    if (!this.city?.trim()) {
      this.validationErrors['city'] = 'Bitte wählen Sie einen Ort aus.';
    }

    if (!this.street?.trim()) {
      this.validationErrors['street'] = 'Bitte wählen Sie eine Straße aus.';
    }

    if (!this.houseNumber?.trim()) {
      this.validationErrors['houseNumber'] = 'Bitte geben Sie die Hausnummer ein.';
    }

    return Object.keys(this.validationErrors).length === 0;
  }

  // ── Submit ───────────────────────────────────────────────────
  submitForm(): void {
    if (!this.validate()) return;

    this.isLoading = true;
    this.errorMessage = '';

    const userId = this.authService.getUserId();
    const deliveryId = this.authService.getDeliveryId();

    const payload = {
      customerId: userId,
      ...(deliveryId && { deliveryId }),
      accountType: 'business',
      salutation: this.salutation,
      title: this.title,
      companyName: this.companyName.trim(),
      firstName: this.firstName,
      lastName: this.lastName,
      emailBusiness: this.emailBusiness.trim(),
      emailPrivate: this.emailPrivate.trim() || null,
      mobile: this.mobile.trim(),
      phone: this.phone.trim() || null,
      dob: this.dob ? this.formatDate(this.dob) : null,
      address: {
        zip: this.zip.trim(),
        city: this.city.trim(),
        street: this.street.trim(),
        houseNumber: this.houseNumber.trim(),
      },
    };

    this.http
      .post<{
        res: boolean;
        deliveryId?: number;
      }>(`${API_BASE}/customer/create-business-account`, payload)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response?.res === true) {
            this.successMessage = 'Account erfolgreich erstellt.';
          } else {
            this.errorMessage = 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.';
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = 'Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.';
          console.error('Submit error:', err);
          this.cdr.detectChanges();
        },
      });
  }

  // ── Helpers ──────────────────────────────────────────────────
  private formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
