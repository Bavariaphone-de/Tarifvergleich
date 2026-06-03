import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { RouterModule } from "@angular/router";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { HttpClient } from "@angular/common/http";
import { AdminCustomer } from "../customer-list/customer-list.component";

@Component({
  selector: "app-customer-details",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CKEditorModule],
  templateUrl: "./customer-details.component.html",
  styleUrl: "./customer-details.component.css",
})
export class CustomerDetailsComponent implements OnInit {
  customer: any = null;
  isLoading = false;
  errorMessage = "";

  isNoteModalOpen = false;
  noteCustomer: any = null;
  currentCustomerNotes: any[] = [];
  noteText = "";
  isSavingNote = false;

  isContactHistoryModalOpen = false;
  contactHistoryText = "";

  // currentContactHistory: any[] = [];
  isSavingContactHistory = false;
  contactHistoryCustomer: any = null;
  customerContactHistory: { [key: number]: any[] } = {};

  isLexofficeModalOpen = false;
  lexofficeInput = "";
  isSavingLexoffice = false;

  //For Send email
  isSendEmailModalOpen = false;
  selectedEmailCustomer: AdminCustomer | null = null;

  emailTitle = "";
  emailSubtitle = "";
  emailMessage = "";
  successMessage = "";
  errorMessageEmail = "";

  public Editor: any = ClassicEditor;
  emailcontent: string = "";

  selectedPdfId: number | null = null;
  pdfList: any[] = [];
  isPdfDropdownOpen = false;
  selectedPdfIds: Set<number> = new Set();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private authService: AuthService,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id");

    if (id) {
      this.fetchCustomerDetails(id);
    }
  }

  fetchCustomerDetails(id: string): void {
    this.isLoading = true;

    const payload = {
      adminId: this.authService.getUserId(),
      id: Number(id),
    };

    this.api.post("admin/fetch-customer-details", payload).subscribe({
      next: (res: any) => {
        this.customer = res?.data || null;
        console.log(this.customer);
        this.isLoading = false;
      },

      error: () => {
        this.errorMessage = "Fehler beim Laden der Kundendetails";
        this.isLoading = false;
      },
    });
  }

  // NOTES
  openNoteModal(customer: any): void {
    this.noteCustomer = customer;
    this.currentCustomerNotes = customer.notes || [];
    this.isNoteModalOpen = true;
  }

  closeNoteModal(): void {
    this.isNoteModalOpen = false;
    this.noteText = "";
  }

  saveCustomerNote(): void {
    if (!this.noteText.trim()) return;
    const newNote = {
      note: this.noteText,
      addedOn: new Date().toLocaleString(),
    };
    this.currentCustomerNotes.unshift(newNote);
    this.noteText = "";
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
  }

  // LEXOFFICE
  openLexofficeModal(): void {
    if (!this.customer) return;
    this.lexofficeInput = this.customer.lexofficeNumber ?? "";
    this.isLexofficeModalOpen = true;
  }

  closeLexofficeModal(): void {
    this.isLexofficeModalOpen = false;
    this.lexofficeInput = "";
    this.isSavingLexoffice = false;
  }

  saveLexofficeNumber(): void {
    if (!this.customer || this.isSavingLexoffice) return;

    const trimmed = this.lexofficeInput.trim();
    if (!trimmed) return;

    this.isSavingLexoffice = true;

    const payload = {
      adminId: this.authService.getUserId(),
      id: this.customer.id,
      lexofficeNumber: trimmed,
    };

    this.api.post("admin/add-lexoffice-number", payload).subscribe({
      next: () => {
        this.customer.lexofficeNumber = trimmed;
        this.closeLexofficeModal();
      },
      error: () => {
        alert("Fehler beim Speichern der Lexoffice-Nummer");
        this.isSavingLexoffice = false;
      },
    });
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
      note: trimmedHistory,
    };

    this.api.post("admin/add-contact-history", payload).subscribe({
      next: () => {
        this.customerContactHistory[this.contactHistoryCustomer!.id].push({
          note: this.contactHistoryText,
          addedOn: new Date().toLocaleString(),
        });
        this.contactHistoryText = "";
        this.isSavingContactHistory = false;
      },
      error: () => {
        this.isSavingContactHistory = false;
      },
    });
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

  goBack(): void {
    this.router.navigate(["/customers"]);
  }

  isTogglingGdpr = false;
  popupError = "";
  gdprSuccessMessage = "";

  closePopupError(): void {
    this.popupError = "";
  }

  toggleGdprStatus(): void {
    if (!this.customer || this.isTogglingGdpr) return;

    this.isTogglingGdpr = true;
    const currentStatus = this.customer.isNotificationEnabled;
    const newStatus = !currentStatus;

    const payload = {
      adminId: this.authService.getUserId(),
      id: this.customer.id,
    };

    this.api.post("admin/toggle-customer-notification", payload).subscribe({
      next: (res: any) => {
        if (res?.res) {
          this.customer.isNotificationEnabled = newStatus;
          this.gdprSuccessMessage = newStatus
            ? "GDPR successfully activated"
            : "GDPR successfully inactivated";

          setTimeout(() => {
            this.gdprSuccessMessage = "";
          }, 3000);
        } else {
          this.popupError =
            res.errMessage ||
            res.message ||
            "Fehler beim Aktualisieren des GDPR-Status";
        }
        this.isTogglingGdpr = false;
      },
      error: () => {
        this.popupError = "Serverfehler beim Aktualisieren des GDPR-Status";
        this.isTogglingGdpr = false;
      },
    });
  }

  // --- Document Methods ---
  documents: any[] = [];

  getFullUrl(url: string): string {
    if (!url) return "";
    if (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("data:")
    ) {
      return url;
    }
    const baseUrl = this.api.baseUrl.endsWith("/")
      ? this.api.baseUrl.slice(0, -1)
      : this.api.baseUrl;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${baseUrl}/assets/customers${path}`;
  }

  viewDocument(url: string): void {
    if (url) {
      window.open(this.getFullUrl(url), "_blank");
    }
  }

  downloadDocument(url: string, fileName: string): void {
    if (!url) return;
    const a = document.createElement("a");
    a.href = this.getFullUrl(url);
    a.download = fileName || "document.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  getFileName(url: any): string {
    if (!url || typeof url !== "string") return "Dokument";
    if (url.startsWith("data:")) return "Document.pdf";
    return url.split("/").pop() || "Dokument";
  }

  /** For Send Email */
  openSendEmailModal(customer: AdminCustomer): void {
    console.log(customer);

    this.selectedEmailCustomer = customer;
    this.isSendEmailModalOpen = true;
    this.loadPdfs();
  }

  closeSendEmailModal(): void {
    this.isSendEmailModalOpen = false;
    this.selectedEmailCustomer = null;

    this.emailTitle = "";
    this.emailSubtitle = "";
    this.emailMessage = "";
    this.selectedPdfIds.clear();
    this.uploadDocuments = [{ file: null }];
  }

  togglePdfDropdown(): void {
    this.isPdfDropdownOpen = !this.isPdfDropdownOpen;
  }

  togglePdfSelection(pdfId: number): void {
    if (this.selectedPdfIds.has(pdfId)) {
      this.selectedPdfIds.delete(pdfId);
    } else {
      this.selectedPdfIds.add(pdfId);
    }
  }

  loadPdfs(): void {
    const payload = {
      adminId: this.authService.getUserId(),
      page: 0,
      size: 100,
    };

    this.api.post("admin/fetch-admin-documents", payload).subscribe({
      next: (res: any) => {
        console.log(res);
        this.pdfList = res.data || res.content || res;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }

  isPdfSelected(pdfId: number): boolean {
    return this.selectedPdfIds.has(pdfId);
  }

  get selectedPdfsLabel(): string {
    const count = this.selectedPdfIds.size;
    if (count === 0) return "Wählen dein PDF";
    if (count === 1) {
      const pdf = this.pdfList.find((p) =>
        this.selectedPdfIds.has(p.adminDocId),
      );
      return pdf?.type || pdf?.documentType || "1 PDF ausgewählt";
    }
    return `${count} PDFs ausgewählt`;
  }

  uploadDocuments: any[] = [{ file: null }];

  onUploadDocumentSelect(event: any, index: number): void {
    const file = event.target.files[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, JPG, JPEG and PNG files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }
    this.uploadDocuments[index].file = file;
  }

  addUploadDocumentField(): void {
    this.uploadDocuments.push({ file: null });
  }

  removeUploadDocumentField(index: number): void {
    this.uploadDocuments.splice(index, 1);
    if (this.uploadDocuments.length === 0) {
      this.uploadDocuments.push({ file: null });
    }
  }

  submitSendEmail(): void {
    if (!this.selectedEmailCustomer) return;

    this.errorMessageEmail = "";
    this.successMessage = "";

    const payload = {
      adminId: this.authService.getUserId(),
      customerId: this.selectedEmailCustomer.id,
      title: this.emailTitle,
      subtitle: this.emailSubtitle,
      emailContent: this.emailMessage,
      // email: this.selectedEmailCustomer.email,

      documentIds: Array.from(this.selectedPdfIds),
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(payload));

    // upload files
    this.uploadDocuments.forEach((doc: any) => {
      if (doc.file) {
        formData.append("uploadDocuments", doc.file);
      }
    });

    this.api.post("admin/send-customer-email", formData).subscribe({
      next: (res: any) => {
        if (res?.res) {
          this.errorMessageEmail = "";
          this.successMessage = "E-Mail erfolgreich gesendet";

          setTimeout(() => {
            this.closeSendEmailModal();
            this.successMessage = "";
          }, 2000);
        } else {
          this.successMessage = "";
          this.errorMessageEmail = res?.errorMessage || "E-Mail nicht gesendet";

          setTimeout(() => {
            this.errorMessageEmail = "";
          }, 3000);
        }
      },

      error: (err) => {
        console.log(err);
        this.successMessage = "";
        this.errorMessageEmail =
          err?.error?.errorMessage ||
          err?.error?.message ||
          "E-Mail nicht gesendet";

        setTimeout(() => {
          this.errorMessageEmail = "";
        }, 3000);
      },
    });
  }
}
