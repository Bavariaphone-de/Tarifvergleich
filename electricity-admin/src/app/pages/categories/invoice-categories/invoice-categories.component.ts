import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";

export interface EnergyCategory {
  supplierMessageCategoryId: number;
  categoryName: string;
  createdOn: number | null;
  updatedOn: number | null;
}

@Component({
  selector: "app-invoice-categories",
  imports: [CommonModule, FormsModule],
  templateUrl: "./invoice-categories.component.html",
  styleUrl: "./invoice-categories.component.css",
})
export class InvoiceCategoriesComponent implements OnInit {
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

    this.api.post("", payload).subscribe({
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
    this.showCategoryModal = true;
  }

  openEditModal(category: EnergyCategory): void {
    this.categoryForm = { ...category }; // clone object
    this.showCategoryModal = true;
  }

  closeCategoryModal(): void {
    this.showCategoryModal = false;
    this.categoryForm = {};
    this.isSaving = false;
  }

  saveCategory(): void {
    if (!this.categoryForm.categoryName?.trim()) return;

    this.isSaving = true;

    // Send supplierMessageCategoryId if it exists (edit), otherwise undefined (create)
    const payload = {
      adminId: this.authService.getUserId(),
      supplierMessageCategoryId:
        this.categoryForm.supplierMessageCategoryId || null,
      categoryName: this.categoryForm.categoryName,
    };

    // The add- endpoint usually handles both add and update in this project
    this.api.post("", payload).subscribe({
      next: (res: any) => {
        this.isSaving = false;
        if (res?.res) {
          this.closeCategoryModal();
          this.fetchCategories(); // Refresh list after saving
        } else {
          alert(res.message || "Failed to save category");
        }
      },
      error: () => {
        this.isSaving = false;
        alert("Something went wrong while saving");
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
      supplierMessageCategoryId: id,
    };

    this.api.post("", payload).subscribe({
      next: (res: any) => {
        this.isDeleting = false;
        if (res?.res) {
          this.categories = this.categories.filter(
            (c) => c.supplierMessageCategoryId !== id,
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
