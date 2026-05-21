import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../shared/services/api.service';
import { AuthService } from '../../../shared/services/auth.service';


@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.css'
})
export class CustomerDetailsComponent implements OnInit {

  customer: any = null;
  isLoading = false;
  errorMessage = '';

  isNoteModalOpen = false;
  noteCustomer: any= null;
  currentCustomerNotes: any[] = [];
  noteText = '';
  isSavingNote = false;


  isContactHistoryModalOpen = false;
  contactHistoryText = '';
  // currentContactHistory: any[] = [];
  isSavingContactHistory = false;
  contactHistoryCustomer: any = null;
  customerContactHistory: { [key: number]: any[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.fetchCustomerDetails(id);
    }
  }

  fetchCustomerDetails(id: string): void {

    this.isLoading = true;

    const payload = {
      adminId: this.authService.getUserId(),
      id: Number(id)
    };

    this.api.post('admin/fetch-customer-details', payload).subscribe({

      next: (res: any) => {

        this.customer = res?.data || null;
        console.log(this.customer);        
        this.isLoading = false;
      },

      error: () => {

        this.errorMessage = 'Fehler beim Laden der Kundendetails';
        this.isLoading = false;
      }
    });
  }

  // NOTES
  openNoteModal(customer: any): void {
    this.noteCustomer = customer;
    this.currentCustomerNotes = customer.notes || [] ;
    this.isNoteModalOpen = true;
  }

  closeNoteModal(): void {
    this.isNoteModalOpen = false;
    this.noteText = '';
  }

  saveCustomerNote() : void {
    if (!this.noteText.trim()) return;
    const newNote = {
      note: this.noteText,
      addedOn: new Date().toLocaleString()
    };
    this.currentCustomerNotes.unshift(newNote);
    this.noteText = '';

  }

  // CONTACT-HISTORY

  openContactHistoryModal(customer: any): void {
    this.contactHistoryCustomer = customer;
    if (!this.customerContactHistory[customer.id]) {
      this.customerContactHistory[customer.id] = [];
    }
    this.contactHistoryText = "";
    this.isContactHistoryModalOpen = true;
  }

  closeContactHistoryModal(): void {
    this.isContactHistoryModalOpen = false;
    this.contactHistoryCustomer = null;
    this.contactHistoryText = "";
    this.isSavingContactHistory = false;
  }

  get currentContactHistory() {
    if (!this.contactHistoryCustomer) {
      return [];
    }
    return this.customerContactHistory[this.contactHistoryCustomer.id] || [];
  }

  saveContactHistory(): void {
    if (!this.contactHistoryCustomer || this.isSavingContactHistory) return;
    const trimmedHistory = this.contactHistoryText.trim();
    if (!trimmedHistory) return;
    this.isSavingContactHistory = true;

    const payload = {
      adminId: this.authService.getUserId(),
      customerId: this.contactHistoryCustomer.id,
      note: trimmedHistory
    };

    this.api.post("admin/add-contact-history", payload).subscribe({
      next: () => {
        this.customerContactHistory[this.contactHistoryCustomer!.id].push({
            note: this.contactHistoryText,
            addedOn: new Date().toLocaleString()
        });
        this.contactHistoryText = "";
        this.isSavingContactHistory = false;
      },
      error: () => {
        this.isSavingContactHistory = false;
      }
    });
  }

  formatDate(value?: number | string | null): string {
    if (value === null || value === undefined || value === '') {
      return '—';
    }

    const num = typeof value === 'number'
      ? value
      : Number(value);

    if (Number.isNaN(num)) {
      return String(value);
    }

    const ms = num < 1_000_000_000_000
      ? num * 1000
      : num;

    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date(ms));
  }

  goBack(): void {
    this.router.navigate(['/customers']);
  }

}