import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { ApiService } from "../../../shared/services/api.service";

@Component({
  selector: "app-email-template-list",
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: "./email-template-list.component.html",
})
export class EmailTemplateListComponent implements OnInit {
  emailList: any[] = [];
  filteredList: any[] = [];
  isLoading = false;
  errorMessage = "";

  test(item: any) {
    console.log(Object.keys(item));
    console.log(item);
  }

  //Fpr CategoryName
  categories: any[] = [];

  // Filters
  searchTerm = "";
  selectedCategory = "";
  docsOnly = false;
  uniqueCategories: string[] = [];

  // PDF Popup
  selectedDocuments: any[] = [];
  showPdfPopup = false;

  // Email Preview Popup
  showEmailPreview = false;
  previewEmail: any = null;

  // Delete Confirm
  showDeleteConfirm = false;
  itemToDelete: any = null;

  constructor(private http: HttpClient,
    private api: ApiService
  ) {}

  ngOnInit(): void {
    this.fetchTemplates();
    this.loadCategories();
  }

  loadCategories(): void {
    this.http
      .post<any[]>("http://192.168.0.155:8080/email-category/all", {
        adminId: 1
      })
      .subscribe({
        next: (res) => {
          this.categories = res || [];
        },
        error: (err) => {
          console.log(err);
        }
      });
  }

  fetchTemplates(): void {
    this.isLoading = true;
    this.api
      .post("admin/email-management/all", {
        adminId: 1,
      })
      .subscribe({
        next: (res) => {
          this.isLoading = false;

          console.log("Full Response", res);
          if(res.length > 0) {
            console.log("First Item", res[0]);
            console.log("Id value", res[0].id);
            console.log("CATEGORY", res[0].category);
          }
          
          this.emailList = res || [];
          this.buildCategoryList();
          this.applyFilters();
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = "Something went wrong";
        },
      });
  }

  buildCategoryList(): void {
    const cats = new Set<string>();
    this.emailList.forEach((e) => {
      if (e.category?.name) cats.add(e.category.name.trim());
    });
    this.uniqueCategories = Array.from(cats).sort();
  }

  getCategoryName(cateId: number): string {
    const found = this.categories.find(
      c => c.cateId === cateId
    );
    return found?.name || '—';
  }

  applyFilters(): void {
    let result = [...this.emailList];

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.subtitle?.toLowerCase().includes(q) ||
          e.category?.name?.toLowerCase().includes(q),
      );
    }

    if (this.selectedCategory) {
      result = result.filter(
        (e) => e.category?.name?.trim() === this.selectedCategory,
      );
    }

    if (this.docsOnly) {
      result = result.filter((e) => e.documents?.length > 0);
    }

    this.filteredList = result;
  }

  toggleDocsOnly(): void {
    this.docsOnly = !this.docsOnly;
    this.applyFilters();
  }

  // ── PDF POPUP ──
  openPdfPopup(email: any): void {
    this.selectedDocuments = email.documents || [];
    this.showPdfPopup = true;
  }

  closePdfPopup(): void {
    this.showPdfPopup = false;
  }

  // ── EMAIL PREVIEW ──
  openEmailPreview(email: any): void {
    this.previewEmail = email;
    this.showEmailPreview = true;
  }

  closeEmailPreview(): void {
    this.showEmailPreview = false;
    this.previewEmail = null;
  }

  // ── DELETE ──
  confirmDelete(item: any): void {
    this.itemToDelete = item;
    this.showDeleteConfirm = true;
  }

  deleteTemplate(): void {

    if (!this.itemToDelete?.id) {
      return;
    }

    this.http.delete(`http://192.168.0.155:8080/admin/email-management/${this.itemToDelete.id}`)
    .subscribe({
      next: (res) => {

        this.emailList = this.emailList.filter(
          item => item.id !== this.itemToDelete.id
        );

        this.filteredList = this.filteredList.filter(
          item => item.id !== this.itemToDelete.id
        );

        this.showDeleteConfirm = false;
        this.itemToDelete = null;

      },

      error: (err) => {
        console.log(err);

      }

    });

  }

  // ── UTILS ──
  stripHtml(html: string): string {
    if (!html) return "";
    return html
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  getInitials(name: string): string {
    if (!name) return "A";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }

  formatUnixDate(ts: number | null): string {
    if (!ts) return "";
    return new Date(ts * 1000).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  getCategoryClass(slug: string): string {
    const map: Record<string, string> = {
      BERATERVOLLMACHT:
        "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
      SERVICE_ANFRAGE:
        "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
      SERVICE_ANFRAGE_ANTWORT:
        "bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
      SERVICE_ANFRAGE_REOPENED:
        "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
      CONTRACT_CONFIRMATION_EMAIL:
        "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300",
      CONTRACT_UPLOAD_REMINDER:
        "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
      METER_READING_NOTIFICATION:
        "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300",
      METER_READING_REMINDER:
        "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
      PREVIOUS_CONTRACT_TERMINATION_CONFIRMATION:
        "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    };
    return (
      map[slug] ||
      "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
    );
  }

  getCategoryDotClass(slug: string): string {
    const map: Record<string, string> = {
      BERATERVOLLMACHT: "bg-purple-500",
      SERVICE_ANFRAGE: "bg-blue-500",
      SERVICE_ANFRAGE_ANTWORT: "bg-cyan-500",
      SERVICE_ANFRAGE_REOPENED: "bg-orange-500",
      CONTRACT_CONFIRMATION_EMAIL: "bg-green-500",
      CONTRACT_UPLOAD_REMINDER: "bg-yellow-500",
      METER_READING_NOTIFICATION: "bg-teal-500",
      METER_READING_REMINDER: "bg-amber-500",
      PREVIOUS_CONTRACT_TERMINATION_CONFIRMATION: "bg-red-500",
    };
    return map[slug] || "bg-gray-400";
  }
}
