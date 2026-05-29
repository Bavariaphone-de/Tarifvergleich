import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { Router } from "@angular/router";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { HttpClient } from "@angular/common/http";

export interface PasswordHistory {
  email: string;
  changeRequestSubmittedOn: number;
  codeSendOn: number | null;
  codeVerifiedOn: number | null;
  passwordChangedOn: number | null;
  confirmationSendOn: number | null;
  otp: string | null;
  customerId: number;
  adminId: number | null;
}

export interface Attorney {
  attornyId: number;
  salutation: string | null;
  title: string | null;
  firstName: string | null;
  lastName: string | null;
  userType: string | null;
  zip: string | null;
  city: string | null;
  street: string | null;
  houseNumber: string | null;
  companyName: string | null;
  legalRepresentativeFirstName: string | null;
  legalRepresentativeLastName: string | null;
  uniqueAttornyId: string;
  submittedOn: number;
  approvalStatus: number; // 0 = pending, 1 = approved, 2 = rejected
  approvedOn: number | null;
  rejectedOn: number | null;
  isRevoked: boolean;
  revokedOn: number | null;
  customerSignaturePath: string | null;
  placeAndDate: string | null;
  isProcessing?: boolean;
}

export type AdminCustomer = {
  id: number | string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  mobileNumber: string | null;
  telephone?: string | null;
  userType: string | null;
  title: string | null;
  salutation: string | null;
  companyName: string | null;
  isVerified: boolean;
  verifiedOn: number | null;
  isAcknowledged: boolean;
  joinedOn: number;
  uniqueCustomerId: string;
  status: boolean;
  changePasswordHistory: PasswordHistory[];
  address: {
    id?: number;
    zip?: string;
    city?: string;
    street?: string;
    houseNumber?: string;
    customerId?: number | null;
  } | null;
  attornies: Attorney[];
  notes?: any[];
  /** Lexoffice number — admin-only field */
  lexofficeNumber: string | null;
};

@Component({
  selector: "app-customer-list",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CKEditorModule],
  templateUrl: "./customer-list.component.html",
  styleUrl: "./customer-list.component.css",
})
export class CustomerListComponent implements OnInit {
  customers: AdminCustomer[] = [];
  isLoading = false;
  errorMessage = "";

  isNoteModalOpen = false;
  noteCustomer: AdminCustomer | null = null;
  noteText = "";
  isSavingNote = false;

  //For Send email
  // isSendEmailModalOpen = false;
  // selectedEmailCustomer: AdminCustomer | null = null;

  // emailTitle = "";
  // emailSubtitle = "";
  // emailMessage = "";
  // successMessage = "";
  // errorMessageEmail = "";

  // Editor = ClassicEditor;
  // emailcontent: string = "";

  // selectedPdfId: number | null = null;
  // pdfList: any[] = [];
  // isPdfDropdownOpen = false;
  // selectedPdfIds: Set<number> = new Set();

  /** Stores multiple admin note per customer id */
  customerNotes: Record<string | number, any[]> = {};

  isLexofficeModalOpen = false;
  lexofficeCustomer: AdminCustomer | null = null;
  lexofficeInput = "";
  isSavingLexoffice = false;

  /** Stores the Lexoffice number per customer id (admin-only) */
  customerLexofficeNumbers: Record<string | number, string> = {};

  /** Currently selected customer shown in the sidebar */
  selectedCustomer: AdminCustomer | null = null;

  hasMoreData = true;
  private readonly PAGE_LIMIT = 20;
  currentPage = 1;
  totalPage: number | null = null;

  searchTerm: string = "";
  selectedUserType: string = "";
  selectedVerifiedStatus: string = "";

  /**
   * Tracks GDPR contact status per customer id.
   * Key: customer.id — Value: boolean (true = GDPR contact enabled)
   */
  gdprContactStatus: Record<string | number, boolean> = {};

  /**
   * Tracks in-flight GDPR API calls per customer id
   * to prevent double-clicks.
   */
  gdprLoading: Record<string | number, boolean> = {};

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.fetchCustomers();
  }

  onFilterChange(): void {
    this.fetchCustomers(1);
  }
  totalRecords = 0;
  totalConsluded = 0;
  totalUnconcluded = 0;
  /** Open sidebar with selected customer */
  selectCustomer(customer: AdminCustomer): void {
    this.selectedCustomer =
      this.selectedCustomer?.id === customer.id ? null : customer;
  }

  /** Close the sidebar */
  closeSidebar(): void {
    this.selectedCustomer = null;
  }

  /** Open note modal for a customer */
  openNoteModal(event: Event, customer: AdminCustomer): void {
    event.stopPropagation();
    this.noteCustomer = customer;
    if (!this.customerNotes[customer.id]) {
      this.customerNotes[customer.id] = [];
    }
    this.noteText = "";
    this.isNoteModalOpen = true;
  }

  /** Close note modal and reset form state */
  closeNoteModal(): void {
    this.isNoteModalOpen = false;
    this.noteCustomer = null;
    this.noteText = "";
    this.isSavingNote = false;
  }

  /**  FOR NOTIZ SECTION */
  get currentCustomerNotes() {
    if (!this.noteCustomer) {
      return [];
    }
    return this.customerNotes[this.noteCustomer.id] || [];
  }

  /** Save note for current customer */
  saveCustomerNote(): void {
    if (!this.noteCustomer || this.isSavingNote) return;

    const trimmedNote = this.noteText.trim();
    if (!trimmedNote) return;

    this.isSavingNote = true;

    const payload = {
      adminId: this.authService.getUserId(),
      customerId: this.noteCustomer.id,
      note: trimmedNote,
    };

    this.api.post("admin/add-note", payload).subscribe({
      next: () => {
        this.customerNotes[this.noteCustomer!.id].push({
          note: trimmedNote,
          addedOn: new Date().toLocaleString(),
        });

        this.noteText = "";
        this.isSavingNote = false;
      },
      error: () => {
        // Keep modal open so admin can retry without losing note text.
        this.isSavingNote = false;
      },
    });
  }

  /** Open Lexoffice number modal for a customer */
  openLexofficeModal(event: Event, customer: AdminCustomer): void {
    event.stopPropagation();
    this.lexofficeCustomer = customer;
    this.lexofficeInput = this.customerLexofficeNumbers[customer.id] ?? "";
    this.isLexofficeModalOpen = true;
  }

  /** Close Lexoffice modal and reset state */
  closeLexofficeModal(): void {
    this.isLexofficeModalOpen = false;
    this.lexofficeCustomer = null;
    this.lexofficeInput = "";
    this.isSavingLexoffice = false;
  }

  /** For Send Email */
  // openSendEmailModal(customer: AdminCustomer): void {
  //   console.log(customer);
    
  //   this.selectedEmailCustomer = customer;
  //   this.isSendEmailModalOpen = true;
  //   this.loadPdfs();
  // }
  // closeSendEmailModal(): void {
  //   this.isSendEmailModalOpen = false;
  //   this.selectedEmailCustomer = null;

  //   this.emailTitle = "";
  //   this.emailSubtitle = "";
  //   this.emailMessage = "";
  //   this.selectedPdfIds.clear();
  //   this.uploadDocuments = [{ file: null }];
  // }

  // togglePdfDropdown(): void {
  //   this.isPdfDropdownOpen = !this.isPdfDropdownOpen;
  // }

  // togglePdfSelection(pdfId: number): void {
  //   if (this.selectedPdfIds.has(pdfId)) {
  //     this.selectedPdfIds.delete(pdfId);
  //   } else {
  //     this.selectedPdfIds.add(pdfId);
  //   }
  // }

  // loadPdfs(): void {
  //     const payload = {
  //       adminId: this.authService.getUserId(),
  //       page: 0,
  //       size: 100,
  //     };

  //     this.api
  //       .post("admin/fetch-admin-documents", payload)
  //       .subscribe({
  //         next: (res: any) => {
  //           console.log(res);
  //           this.pdfList = res.data || res.content || res;
  //         },
  //         error: (err) => {
  //           console.log(err);
  //         },
  //       });
  //   }

  // isPdfSelected(pdfId: number): boolean {
  //   return this.selectedPdfIds.has(pdfId);
  // }

  // get selectedPdfsLabel(): string {
  //   const count = this.selectedPdfIds.size;
  //   if (count === 0) return "Wählen dein PDF";
  //   if (count === 1) {
  //     const pdf = this.pdfList.find((p) =>
  //       this.selectedPdfIds.has(p.adminDocId),
  //     );
  //     return pdf?.type || pdf?.documentType || "1 PDF ausgewählt";
  //   }
  //   return `${count} PDFs ausgewählt`;
  // }

  // uploadDocuments: any[] = [{ file: null }];

  // onUploadDocumentSelect(event: any, index: number): void {
  //   const file = event.target.files[0];
  //   if (!file) return;

  //   const allowedTypes = ['application/pdf','image/png','image/jpeg'];
  //   if (!allowedTypes.includes(file.type)) {
  //     alert('Only PDF, JPG, JPEG and PNG files are allowed');
  //     return;
  //   }

  //   if (file.size > 10 * 1024 * 1024) {
  //     alert('File size must be less than 10MB');
  //     return;
  //   }
  //   this.uploadDocuments[index].file = file;
  // }

  // addUploadDocumentField(): void {
  //   this.uploadDocuments.push({ file: null });
  // }

  // removeUploadDocumentField(index: number): void {
  //   this.uploadDocuments.splice(index, 1);
  //     if (this.uploadDocuments.length === 0) {
  //       this.uploadDocuments.push({ file: null });
  //     }
  // }

  // submitSendEmail(): void {

  //   if (!this.selectedEmailCustomer) return;

  //   this.errorMessageEmail = "";
  //   this.successMessage = "";

  //   const payload = {
  //     adminId: this.authService.getUserId(),
  //     customerId: this.selectedEmailCustomer.id,
  //     title: this.emailTitle,
  //     subtitle: this.emailSubtitle,
  //     emailContent: this.emailMessage,
  //     // email: this.selectedEmailCustomer.email,

  //     // changed from pdfIds
  //     documentIds: Array.from(this.selectedPdfIds),
  //   };

  //   const formData = new FormData();
  //   formData.append("data", JSON.stringify(payload));

  //   // upload files
  //   this.uploadDocuments.forEach((doc: any) => {
  //     if (doc.file) {
  //       formData.append("uploadDocuments", doc.file);
  //     }
  //   });

  //   this.api.post("admin/send-customer-email", formData)
  //     .subscribe({
  //       next: (res: any) => {

  //         if (res?.res) {
  //           this.errorMessageEmail = "";
  //           this.successMessage = "E-Mail erfolgreich gesendet";

  //           setTimeout(() => {
  //             this.closeSendEmailModal();
  //             this.successMessage = "";
  //           }, 2000);

  //             this.fetchCustomers();

  //         } else {
  //           this.successMessage = "";
  //           this.errorMessageEmail =
  //             res?.errorMessage || "E-Mail nicht gesendet";

  //           setTimeout(() => {
  //             this.errorMessageEmail ="";
  //           }, 3000);
  //         }
  //       },

  //       error: (err) => {
  //         console.log(err);
  //         this.successMessage = "";
  //         this.errorMessageEmail = err?.error?.errorMessage || err?.error?.message ||"E-Mail nicht gesendet";

  //         setTimeout(() => {
  //           this.errorMessageEmail ="";
  //         }, 3000);
  //       }
  //     });
  // }

  /** Save Lexoffice number for the selected customer */
  saveLexofficeNumber(): void {
    if (!this.lexofficeCustomer || this.isSavingLexoffice) return;

    const trimmed = this.lexofficeInput.trim();
    if (!trimmed) return;

    this.isSavingLexoffice = true;

    const payload = {
      id: this.lexofficeCustomer.id,
      adminId: this.authService.getUserId(),
      lexofficeNumber: trimmed,
    };

    this.api.post("admin/add-lexoffice-number", payload).subscribe({
      next: () => {
        this.customerLexofficeNumbers[this.lexofficeCustomer!.id] = trimmed;
        this.closeLexofficeModal();
      },
      error: () => {
        this.isSavingLexoffice = false;
      },
    });
  }

  fetchCustomers(page: number = 1): void {
    this.currentPage = page;
    const payload = {
      adminId: this.authService.getUserId(),
      page: this.currentPage,
      search: this.searchTerm,
      userType: this.selectedUserType,
      isVerified: this.selectedVerifiedStatus,
    };

    this.isLoading = true;
    this.errorMessage = "";
    this.selectedCustomer = null;

    this.api.post("admin/fetch-customer-details", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        const newData = this.extractList(res);
        this.customers = newData;
        this.hasMoreData = newData.length === this.PAGE_LIMIT;
        this.totalPage = res?.totalPage ?? null;

        this.totalRecords = res?.totalRecords || 0;
        this.totalConsluded = res?.totalConsluded || 0;
        this.totalUnconcluded = res?.totalUnconcluded || 0;

        // Initialise GDPR state for any new customers (preserve existing toggles)
        newData.forEach((c) => {
          if (!(c.id in this.gdprContactStatus)) {
            this.gdprContactStatus[c.id] = false;
        
          }

          if (!(c.id in this.customerNotes)) {
            this.customerNotes[c.id] = c.notes || [];
          }

          // Seed Lexoffice number from API response (prefer existing local edit)
          if (!(c.id in this.customerLexofficeNumbers)) {
            this.customerLexofficeNumbers[c.id] = c.lexofficeNumber ?? "";
          }
        });
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Kundenliste.";
      },
    });
  }

  nextPage(): void {
    if (this.hasMoreData) {
      this.fetchCustomers(this.currentPage + 1);
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.fetchCustomers(this.currentPage - 1);
    }
  }

  openCustomerDetails(id: number | string): void {
    this.router.navigate(["/customers/details", id]);
  }

  formatDate(value?: number | string | null): string {
    if (value === null || value === undefined || value === "") {
      return "—";
    }

    const num = typeof value === "number" ? value : Number(value);

    if (Number.isNaN(num)) {
      return String(value);
    }

    const ms = num < 1_000_000_000_000 ? num * 1000 : num;

    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date(ms));
  }

  /**
   * Toggle GDPR contact permission for a customer.
   * Calls the mock endpoint admin/update-gdpr-contact-status.
   * Stops row-click propagation so the sidebar does not open/close.
   */
  toggleGdprContact(event: Event, customer: AdminCustomer): void {
    event.stopPropagation();

    if (this.gdprLoading[customer.id]) return;

    const newStatus = !this.gdprContactStatus[customer.id];
    this.gdprLoading[customer.id] = true;

    const payload = {
      adminId: this.authService.getUserId(),
      id: customer.id,
    };

    this.api.post("admin/toggle-customer-notification", payload).subscribe({
      next: () => {
        this.gdprContactStatus[customer.id] = newStatus;
        this.gdprLoading[customer.id] = false;
      },
      error: () => {
        // Revert optimistic update on error
        this.gdprLoading[customer.id] = false;
      },
    });
  }

  /** Approve an attorney */
  approveAttorney(customer: AdminCustomer, attorney: Attorney): void {
    if (attorney.isProcessing) return;
    attorney.isProcessing = true;

    const payload = {
      adminId: this.authService.getUserId(),
      customerId: customer.id,
      attornyId: attorney.attornyId,
      status: 1,
    };

    this.api.post("admin/update-attorny-status", payload).subscribe({
      next: () => {
        attorney.approvalStatus = 1;
        attorney.approvedOn = Math.floor(Date.now() / 1000);
        attorney.isProcessing = false;
      },
      error: () => {
        attorney.isProcessing = false;
      },
    });
  }

  /** Reject an attorney */
  rejectAttorney(customer: AdminCustomer, attorney: Attorney): void {
    if (attorney.isProcessing) return;
    attorney.isProcessing = true;

    const payload = {
      adminId: this.authService.getUserId(),
      customerId: customer.id,
      attornyId: attorney.attornyId,
      status: 2,
    };

    this.api.post("admin/update-attorny-status", payload).subscribe({
      next: () => {
        attorney.approvalStatus = 2;
        attorney.rejectedOn = Math.floor(Date.now() / 1000);
        attorney.isProcessing = false;
      },
      error: () => {
        attorney.isProcessing = false;
      },
    });
  }

  /** Safely construct full name */
  fullName(customer: AdminCustomer): string {
    const first = (customer.firstName || "").trim();
    const last = (customer.lastName || "").trim();
    const value = [first, last].filter(Boolean).join(" ").trim();
    return value || "Keine Angabe";
  }

  /** Private mapper to ensure the UI data structure is consistent */
  private extractList(response: any): AdminCustomer[] {
    const list = Array.isArray(response?.data) ? response.data : [];

    return list.map((item: any) => ({
      id: item.id,
      email: item.email ?? null,
      firstName: item.firstName ?? null,
      lastName: item.lastName ?? null,
      mobileNumber: item.mobileNumber ?? null,
      telephone: item.telephone ?? null,
      userType: item.userType ?? "PRIVATE",
      title: item.title ?? "",
      salutation: item.salutation ?? "",
      companyName: item.companyName ?? null,
      isVerified: !!item.isVerified,
      verifiedOn: item.verifiedOn ?? null,
      isAcknowledged: !!item.isAcknowledged,
      joinedOn: item.joinedOn ?? 0,
      uniqueCustomerId: item.uniqueCustomerId ?? "-",
      status: !!item.status,
      changePasswordHistory: Array.isArray(item.changePasswordHistory)
        ? item.changePasswordHistory
        : [],
      address: item.address ? { ...item.address } : null,
      attornies: Array.isArray(item.attornies)
        ? item.attornies.map((a: any) => ({ ...a, isProcessing: false }))
        : [],

      notes: item.notes ?? [],
      lexofficeNumber: item.lexofficeNumber ?? null,
    }));
  }
}
