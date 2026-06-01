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
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Registration } from '../../layout/registration/registration';
import { ContentService } from '../../services/content.service';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { AddressService } from '../../services/address.service';
import { debounceTime, switchMap, of } from 'rxjs';

export interface SingelDoubleMeter {
  singleTariff: '';
  doubleTariff: '';
  singleImage: '';
  doubleImage: '';
  singleDescription: '';
  doubleDescription: '';
}

export interface NightStorageHeaters {
  description1: '';
  description2: '';
}

export interface InfoDialogData {
  title?: string;
  image?: string;
  description: string;
}

export interface InfoDialogDiscount {
  description: string;
}

@Component({
  selector: 'app-night-heaters',
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
  templateUrl: './night-heaters.html',
  styleUrl: './night-heaters.css',
})
export class NightHeaters {
  selectedOption: 'ja' | 'nein' = 'ja';
  selectedTariff: 'single' | 'double' = 'single';
  activeInfo: 'eintarif' | 'heizstrom' | null = null;

  currentDialogData: InfoDialogData[] = [];
  getrenntMessungHtml: string = `<p>Der Stromverbrauch von Nachtspeicherheizungen wird in der Regel mit einem eigenen separaten Stromzähler gemessen. Ist dies auch bei Ihnen der Fall,
  finden Sie in Ihrem Keller zwei Zähler vor: einen für Heizstrom und einen weiteren für den üblichen Haushaltsstrom.</p>
  <br/>
  <p>Bei einigen älteren Nachtspeicherheizungen wird Haushaltsstrom und Heizstrom noch gemeinsam gemessen, es gibt also nur einen Stromzähler für beide Arten von Verbräuchen.</p>`;

  singleDoubleMeterHtml: string | null = null;

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
  citySearch = '';
  filteredCityOptions: any[] = [];
  showCityDropdown = false;
  streetDropdownKey = 0;
  isStreetLoading = false;
  streetSearch = '';
  filteredStreetOptions: any[] = [];
  showDropdown = false;
  lastValidCity: { city: string; city_id: string } | null = null;
  lastValidStreet: string | null = null;
  consumption: number | null = 1600;

  ngOnInit() {
    this.contentService.getSidebar().subscribe((sidebar: any[]) => {
      const item = sidebar.find((s) => s.originalFileName === 'Nachtspeicherofen.png');
      if (item) {
        if (item.savingPriceDetail) this.discountInfo.description = item.savingPriceDetail;

        // Connect Admin popupContent2 to the Night Storage popup
        if (item.popupContent2) {
          this.nightStorageHeaters.description1 = item.popupContent2;
          this.nightStorageHeaters.description2 = ''; // Hide default second paragraph
        }

        // If they provide a single HTML block via popupContent3, use it directly
        if (item.popupContent3) {
          this.singleDoubleMeterHtml = item.popupContent3;
        }
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

  eintarif = `Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
  Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).
  Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein Verbrauchswert
  zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung`;

  heizstrom = `Der Stromverbrauch von Nachtspeicherheizungen wird in der Regel mit einem eigenen separaten Stromzähler gemessen. Ist dies auch bei Ihnen der Fall,
  finden Sie in Ihrem Keller zwei Zähler vor: einen für Heizstrom und einen weiteren für den üblichen Haushaltsstrom.

  Bei einigen älteren Nachtspeicherheizungen wird Haushaltsstrom und Heizstrom noch gemeinsam gemessen, es gibt also nur einen Stromzähler für beide Arten von Verbräuchen.`;

  singleDoubleMeter = {
    singleTariff: 'Eintarifzähler ermitteln den Verbrauch von Strom.',

    doubleTariff: `Eintarifzähler ermitteln den Verbrauch von Strom.`,

    singleImage: '/assets/images/single_meter.png',
    doubleImage: '/assets/images/double_meter.png',

    singleDescription: `Ihr Heizstromzähler ist entweder mit einem Zählwerk ausgestattet (Eintarifzähler) oder er besitzt zwei Zählwerke (Doppeltarifzähler).
        Während der Eintarifzähler nur einen Verbrauchswert anzeigt, erfasst der Doppeltarifzähler zwei Verbrauchswerte (HT = Hochtarif, NT = Niedertarif).`,
    doubleDescription: `Welcher Zählertyp bei Ihnen verbaut ist, können Sie auch mithilfe Ihrer letzten Abrechnung herausfinden: Bei einem Eintarifzähler wird Ihnen ein Verbrauchswert
      zu einem Arbeitspreis in Rechnung gestellt. Bei einem Doppeltarifzähler werden Ihnen in der Regel zwei Verbrauchswerte und zwei Arbeitspreise (HT und NT) in Rechnung gestellt.`,
  };

  nightStorageHeaters = {
    description1: `Der Stromverbrauch von Nachtspeicherheizungen wird in der Regel mit einem eigenen separaten Stromzähler gemessen. Ist dies auch bei Ihnen der Fall,
  finden Sie in Ihrem Keller zwei Zähler vor: einen für Heizstrom und einen weiteren für den üblichen Haushaltsstrom.`,
    description2: `Bei einigen älteren Nachtspeicherheizungen wird Haushaltsstrom und Heizstrom noch gemeinsam gemessen, es gibt also nur einen Stromzähler für beide Arten von Verbräuchen.`,
  };

  discountInfo = {
    description: `<p> <strong>So haben wir gerechnet </strong> </p>
      <p> Wohnort: <i> Dortmund, 44141 </i>
       Jahresverbrauch: <i> 4.000 kWh </i> </p>
      <p> Günstigster Tarif: immergrün! Spar Smart FairMax, Kosten im ersten Jahr: 920,84 Euro </p>
      <p> Grundversorgungstarif: Dortmunder Energie- und Wasserversorgung GmbH Unser Strom.standard, Kosten: 1.828,72 Euro </p>
      <p><strong>Einsparung: 907,88 Euro</strong> <p>
      <p>(Stand: 16.02.2026) </p> `,
  };

  select(option: 'ja' | 'nein') {
    this.selectedOption = option;

    if (option === 'nein') {
      this.selectedTariff = 'single';
    }
  }

  tariff(type: 'single' | 'double') {
    this.selectedTariff = type;
  }

  isSingleDoubleMeterPopup = false;

  openNightStorage(template: any) {
    this.isSingleDoubleMeterPopup = false;
    this.currentDialogData = [
      {
        description: this.nightStorageHeaters.description1,
      },
      {
        description: this.nightStorageHeaters.description2,
      },
    ];
    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
  }

  openSingleDoubleMeter(template: any) {
    this.isSingleDoubleMeterPopup = true;
    this.currentDialogData = [
      {
        title: this.singleDoubleMeter.singleTariff,
        image: this.singleDoubleMeter.singleImage,
        description: this.singleDoubleMeter.singleDescription,
      },
      {
        title: this.singleDoubleMeter.doubleTariff,
        image: this.singleDoubleMeter.doubleImage,
        description: this.singleDoubleMeter.doubleDescription,
      },
    ];
    this.dialog.open(template, { width: '470px', maxWidth: '80vw' });
  }

  openDiscountInfo(template: any) {
    this.isSingleDoubleMeterPopup = false;
    this.currentDialogData = [
      {
        description: this.discountInfo.description,
      },
    ];
    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
  }

  currentDialogText = '';

  openInfo(template: any, text: string) {
    this.isSingleDoubleMeterPopup = false;
    this.currentDialogData = [
      {
        description: text,
      },
    ];
    this.dialog.open(template, { width: '200px', maxWidth: '80vw' });
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
  goToComparison() {
    if (this.addressForm.invalid) {
      console.log('invalid address');
      this.addressForm.markAllAsTouched();
      return;
    }

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
      // persons: this.selectedPersons,
      consumption: this.consumption,
      rateType: 2,
      route: 'electricity',
    };

    this.authService.setAddressData(data);

    this.router.navigate(['/electricity-comparision']);
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
