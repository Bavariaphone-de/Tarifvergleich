import { Component, OnInit } from "@angular/core";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";

import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

export interface EnergyCategory {
  reportMeterReadingCategoryId: number;
  categoryName: string;
  createdOn: number | null;
  updatedOn: number | null;
}

@Component({
  selector: "app-report-meter-reading-category",
  imports: [CommonModule, FormsModule],
  templateUrl: "./report-meter-reading-category.component.html",
  styleUrl: "./report-meter-reading-category.component.css",
})
export class ReportMeterReadingCategoryComponent implements OnInit {
  categories: EnergyCategory[] = [];
  isLoading = false;
  errorMessage = "";

  // Delete Modal State Variables
  showDeleteConfirm = false;
  categoryIdToDelete: number | null = null;
  isDeleting = false;

  // Add/Edit Modal State Variables
  showCategoryModal = false;
  isSaving = false;
  categoryForm: Partial<EnergyCategory> = {};
  modalErrorMessage = "";

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
  }

  fetchCategories(): void {
    this.isLoading = true;
    this.errorMessage = "";

    const payload = {
      adminId: this.authService.getUserId(),
      page: 1,
    };

    this.api
      .post("admin/fetch-report-meter-reading-category", payload)
      .subscribe({
        next: (res: any) => {
          this.isLoading = false;
          if (res && (res.res || res.data || Array.isArray(res))) {
            this.categories = Array.isArray(res.data)
              ? res.data
              : Array.isArray(res)
                ? res
                : [];
          } else {
            this.errorMessage =
              res?.message || "Fehler beim Laden der Kategorien.";
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = "Ein Verbindungsfehler ist aufgetreten.";
          console.error("Fetch Categories Error:", err);
        },
      });
  }

  // --- Add/Edit Modal Logic ---
  openAddModal(): void {
    this.categoryForm = { categoryName: "" };
    this.modalErrorMessage = "";
    this.showCategoryModal = true;
  }

  openEditModal(category: EnergyCategory): void {
    this.categoryForm = { ...category }; // clone object
    this.modalErrorMessage = "";
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.categoryForm = {};
    this.isSaving = false;
    this.modalErrorMessage = "";
  }

  saveCategory(): void {
    if (!this.categoryForm.categoryName?.trim()) return;

    this.isSaving = true;
    this.modalErrorMessage = "";

    // Send reportMeterReadingCategoryId if it exists (edit), otherwise undefined (create)
    const payload = {
      adminId: this.authService.getUserId(),
      reportMeterReadingCategoryId:
        this.categoryForm.reportMeterReadingCategoryId || null,
      categoryName: this.categoryForm.categoryName,
    };

    // The add- endpoint usually handles both add and update in this project
    this.api
      .post("admin/add-report-meter-reading-category", payload)
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          if (res?.res) {
            this.closeCategoryModal();
            this.fetchCategories(); // Refresh list after saving
          } else {
            this.modalErrorMessage =
              res.errMessage || res.message || "Failed to save category";
          }
        },
        error: () => {
          this.isSaving = false;
          this.modalErrorMessage = "Something went wrong while saving";
        },
      });
  }

  // --- Delete Modal Logic ---
  promptDelete(id: number): void {
    this.categoryIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.categoryIdToDelete = null;
    this.isDeleting = false;
  }

  confirmDelete(): void {
    if (this.categoryIdToDelete === null) return;

    this.isDeleting = true;
    const id = this.categoryIdToDelete;

    const payload = {
      adminId: this.authService.getUserId(),
      reportMeterReadingCategoryId: id,
    };

    this.api
      .post("admin/delete-report-meter-reading-category", payload)
      .subscribe({
        next: (res: any) => {
          this.isDeleting = false;
          if (res?.res) {
            this.categories = this.categories.filter(
              (c) => c.reportMeterReadingCategoryId !== id,
            );
            this.cancelDelete();
          } else {
            alert(res.message || "Delete failed");
            this.cancelDelete();
          }
        },
        error: () => {
          this.isDeleting = false;
          alert("Something went wrong");
          this.cancelDelete();
        },
      });
  }
}
