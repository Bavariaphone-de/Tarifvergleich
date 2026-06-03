import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { debounceTime, switchMap, of } from 'rxjs';
import { AddressService } from './../../services/address.service';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Registration } from '../../layout/registration/registration';
import { ContentService } from '../../services/content.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gas',
  imports: [
    Registration,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    NgSelectModule,
    FormsModule,
  ],
  templateUrl: './gas.html',
  styleUrl: './gas.css',
})
export class Gas implements OnInit {
  addressForm!: FormGroup;
  cityOptions: { city: string; city_id: string }[] = [];
  streetOptions: { street: string; street_id: string }[] = [];

  constructor(
    public dialog: MatDialog,
    private fb: FormBuilder,
    private addressService: AddressService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private authService: AuthService,
    private contentService: ContentService,
  ) {}

  discountinfo: string | null =
    'Die mögliche Ersparnis berechnet sich aus dem Vergleich zum örtlichen Grundversorger bei einem durchschnittlichen Verbrauch.';
  citySearch = '';
  filteredCityOptions: any[] = [];
  showCityDropdown = false;
  selectedPersons: number | null = 3;
  consumption = 20500;
  activeInfo: 'discountinfo' | null = null;
  streetDropdownKey = 0;
  isStreetLoading = false;
  streetSearch = '';
  filteredStreetOptions: any[] = [];
  showDropdown = false;
  lastValidCity: { city: string; city_id: string } | null = null;
  lastValidStreet: string | null = null;
  consumptionError = false;

  ngOnInit(): void {
    this.contentService.getSidebar().subscribe((sidebar: any[]) => {
      const item = sidebar.find((s) => s.originalFileName === 'Hausstrom.png');
      if (item && item.savingPriceDetail) {
        this.discountinfo = item.savingPriceDetail;
      }
    });

    this.addressForm = this.fb.group({
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],

      // city: [{ value: '', disabled: true }, Validators.required],
      city: [{ value: null, disabled: true }, Validators.required],

      street: [{ value: null, disabled: true }, Validators.required],

      houseNumber: [
        { value: '', disabled: true },
        [Validators.required, Validators.maxLength(6), Validators.pattern(/^[a-zA-Z0-9\s\/]*$/)],
      ],
    });

    this.handlePostalCodeChanges();
    this.handleCityChanges();
    this.handleStreetChanges();
  }

  trackByStreet(index: number, item: any) {
    return item.street;
  }

  onCityInput(event: any) {
    if (this.addressForm.get('city')?.disabled) return;
    this.closeAllDropdowns();
    const value = event.target.value.trim().toLowerCase();
    this.citySearch = value;

    this.filteredCityOptions = this.cityOptions.filter((c) => c.city.toLowerCase().includes(value));

    this.showCityDropdown = true;
  }
  onCityFocus(event: Event) {
    event.stopPropagation();
    this.closeAllDropdowns();
    this.showCityDropdown = true;
  }
  selectCity(city: any) {
    this.citySearch = city.city;

    this.addressForm.get('city')?.setValue(city.city_id);
    this.lastValidCity = city;
    this.showCityDropdown = false;

    this.filteredCityOptions = this.cityOptions;
  }

  onStreetInput(event: any) {
    if (this.addressForm.get('street')?.disabled) return;
    const value = event.target.value.trim().toLowerCase();
    this.streetSearch = value;

    this.filteredStreetOptions = this.streetOptions.filter((s) =>
      (s.street ?? '').toLowerCase().includes(value),
    );

    this.showDropdown = true;
  }

  selectStreet(street: any) {
    this.streetSearch = street.street;

    this.addressForm.get('street')?.setValue(street.street);

    this.lastValidStreet = street.street;
    this.showDropdown = false;

    this.filteredStreetOptions = this.streetOptions;
  }

  closeAllDropdowns() {
    this.showCityDropdown = false;
    this.showDropdown = false;
  }

  private handlePostalCodeChanges() {
    this.addressForm
      .get('postalCode')
      ?.valueChanges.pipe(
        debounceTime(500),
        switchMap((zip) => {
          const isValidZip = /^\d{5}$/.test(zip);

          this.resetCity();
          this.resetStreet();
          this.resetHouseNumber();
          if (!isValidZip) {
            return of([]);
          }
          if (zip && zip.length === 5) {
            return this.addressService.getCitiesByZip(zip);
          }

          return of([]);
        }),
      )
      .subscribe((cities) => {
        console.log('Cities:', cities);

        this.cityOptions = cities;
        this.filteredCityOptions = cities;

        if (cities.length > 0) {
          this.addressForm.get('city')?.enable();

          // const firstCity = cities[0].city_id;
          // this.addressForm.get('city')?.setValue(firstCity);
          if (cities.length === 1) {
            const city = cities[0];

            this.citySearch = city.city;
            this.lastValidCity = city;
            this.showCityDropdown = false;

            this.addressForm.get('city')?.setValue(city.city_id);
            this.cdr.detectChanges();
          }
        } else {
          this.addressForm.get('city')?.disable();
        }

        this.cdr.detectChanges();
      });
  }

  private handleCityChanges() {
    this.addressForm
      .get('city')
      ?.valueChanges.pipe(debounceTime(300))
      .subscribe((placeId) => {
        const zip = this.addressForm.get('postalCode')?.value;

        this.streetOptions = [];
        this.resetStreet();
        this.resetHouseNumber();
        this.isStreetLoading = true;

        this.addressForm.get('street')?.enable();
        this.addressService.getStreetsByCity(zip, this.citySearch).subscribe((streets) => {
          const currentZip = this.addressForm.get('postalCode')?.value;
          if (!/^\d{5}$/.test(currentZip)) {
            return;
          }
          this.ngZone.run(() => {
            this.streetOptions = streets;

            this.filteredStreetOptions = [...streets];

            this.streetDropdownKey++;
            const streetControl = this.addressForm.get('street');
            streetControl?.setValue(null);

            this.isStreetLoading = false;
            this.cdr.detectChanges();

            if (streets.length > 0) {
              this.addressForm.get('street')?.enable();
            }
            this.streetSearch = '';
            this.showDropdown = true;

            this.cdr.detectChanges();
          });
        });
      });
  }

  private handleStreetChanges() {
    this.addressForm.get('street')?.valueChanges.subscribe((street) => {
      if (!street) return;
      this.resetHouseNumber();
      this.addressForm.get('houseNumber')?.enable();
    });
  }

  private resetCity() {
    this.cityOptions = [];
    this.filteredCityOptions = [];
    this.citySearch = '';
    this.showCityDropdown = false;
    this.lastValidCity = null;

    const control = this.addressForm.get('city');
    control?.reset(null, { emitEvent: false });
    control?.disable();
    // this.addressForm.get('city')?.reset();
    // this.addressForm.get('city')?.disable();
  }

  private resetStreet() {
    this.streetOptions = [];
    this.filteredStreetOptions = [];
    this.streetSearch = '';
    this.showDropdown = false;
    this.lastValidStreet = '';

    const control = this.addressForm.get('street');
    control?.reset(null, { emitEvent: false });
    control?.disable();
    // this.addressForm.get('street')?.reset();
    // this.addressForm.get('street')?.disable();
  }

  private resetHouseNumber() {
    this.addressForm.get('houseNumber')?.reset();
    this.addressForm.get('houseNumber')?.disable();
  }

  setConsumption(value: number) {
    this.consumption = value;
  }
  onConsumptionInput(): void {
    const predefinedValues = [
      { person: 1, value: 5050 },
      { person: 2, value: 12000 },
      { person: 3, value: 20500 },
      { person: 4, value: 28000 },
    ];

    const match = predefinedValues.find((item) => item.value === Number(this.consumption));

    this.selectedPersons = match ? match.person : 0;
    this.consumptionError = false;
  }

  selectPersons(persons: number, value: number) {
    this.selectedPersons = persons;
    this.consumption = value;
  }

  currentDialogText = '';

  openInfo(template: any, text: string) {
    this.currentDialogText = text;

    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
  }

  goToComparison() {
    if (this.addressForm.invalid) {
      console.log('invalid address');
      this.addressForm.markAllAsTouched();
      return;
    }
    const consumptionValue = Number(this.consumption);

    if (!consumptionValue || consumptionValue <= 0) {
      this.consumptionError = true;
      return;
    }

    this.consumptionError = false;

    const selectedCityId = this.addressForm.value.city;

    const selectedCityObj = this.cityOptions.find((c) => c.city_id === selectedCityId);
    if (!selectedCityObj) {
      return; // or show error
    }

    const data = {
      zip: this.addressForm.value.postalCode,
      city: selectedCityObj.city,
      city_id: selectedCityObj.city_id,
      street: this.addressForm.value.street,
      houseNumber: this.addressForm.value.houseNumber,
      persons: this.selectedPersons,
      consumption: this.consumption,
      route: 'gas',
    };

    this.authService.setAddressData(data);

    this.router.navigate(['/gas-comparision']);
  }

  @ViewChild('cityDropdown') cityDropdown!: ElementRef;
  @ViewChild('streetDropdown') streetDropdown!: ElementRef;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    // CITY
    if (this.cityDropdown && !this.cityDropdown.nativeElement.contains(target)) {
      this.showCityDropdown = false;

      if (!this.isValidCity(this.citySearch)) {
        this.revertCity();
      }
    }

    // STREET
    if (this.streetDropdown && !this.streetDropdown.nativeElement.contains(target)) {
      this.showDropdown = false;

      if (!this.isValidStreet(this.streetSearch)) {
        this.revertStreet();
      }
    }
  }
  private isValidCity(value: string): boolean {
    return this.cityOptions.some((c) => c.city === value);
  }
  private isValidStreet(value: string): boolean {
    const v = (value ?? '').trim().toLowerCase();
    return this.streetOptions.some((s) => (s.street ?? '').trim().toLowerCase() === v);
  }

  private revertCity() {
    if (this.lastValidCity) {
      this.citySearch = this.lastValidCity.city;
      this.addressForm.get('city')?.setValue(this.lastValidCity.city_id);
    } else {
      this.citySearch = '';
      this.addressForm.get('city')?.reset();
    }
  }

  private revertStreet() {
    if (this.lastValidStreet) {
      this.streetSearch = this.lastValidStreet;
      this.addressForm.get('street')?.setValue(this.lastValidStreet);
    } else {
      this.streetSearch = '';
      this.addressForm.get('street')?.reset();
    }
  }
}
