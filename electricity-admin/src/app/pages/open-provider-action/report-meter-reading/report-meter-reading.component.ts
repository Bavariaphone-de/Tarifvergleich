import { Component, OnInit } from "@angular/core";
import { CommonModule, NgClass } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { Router } from "@angular/router";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from '@angular/forms';

export interface ReportMeterReading {
  id?: number;
  deliveryId?: number;
  orderId?: number;
  connectionId?: number;
  category?: string;
  readingDate?: string;
  meterReading?: string;
  imagePath?: string;
  status?: number;
  createdAt?: string;
}

@Component({
  selector: 'app-report-meter-reading',
  imports: [
    CommonModule,
    NgClass,
    FormsModule
  ],
  standalone: true,
  templateUrl: './report-meter-reading.component.html',
  styleUrl: './report-meter-reading.component.css',
})
export class ReportMeterReadingComponent implements OnInit {

  reportMeterReadings: ReportMeterReading[] = [];

  isLoading = false;
  errorMessage = '';

  filterStatus = 0;
  filterOptions = [
    { value: 0, label: 'Alle' },
    { value: 1, label: 'Aktiv' },
    { value: 2, label: 'Inaktiv' }
  ];
  isFilterOpen = false;

  searchTerm = '';

  constructor(
    // private api: ApiService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchReportMeterReadings();
  }

  fetchReportMeterReadings(): void {

    this.isLoading = true;
    this.errorMessage = '';

    this.http.get('http://localhost:8080/admin/report-meter-reading')
      .subscribe({
        next: (res: any) => {

          this.isLoading = false;

          if (Array.isArray(res)) {
            this.reportMeterReadings = res;
          } else if (res?.data) {
            this.reportMeterReadings = res.data;
          } else {
            this.reportMeterReadings = [];
          }
        },

        error: (err : any) => {

          this.isLoading = false;
          this.errorMessage =
            'Fehler beim Laden der Messwertmeldungen';

          console.error(err);
        }
      });
  }

  formatDate(date?: string): string {

    if (!date) return '—';

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  }

  getActiveCount(): number {
    return this.reportMeterReadings.filter(
      item => item.status === 1
    ).length;
  }

  getSelectedFilterLabel(): string {
    return (
      this.filterOptions.find(f => f.value === this.filterStatus)?.label ||
      'Alle'
    );
  }

  openDetail(reading: ReportMeterReading): void {
    console.log(reading);
    // later navigate to detail page
    // this.router.navigate(['/open-provider-action/report-meter-reading', reading.id]);
  }

}
