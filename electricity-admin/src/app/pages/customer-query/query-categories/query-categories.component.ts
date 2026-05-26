import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { FormsModule } from "@angular/forms";
import { RouterModule } from "@angular/router";

export interface ServiceCategory {
  serviceId: number;
  serviceName: string;
  addedOn: number | null;
}

@Component({
  selector: "app-query-categories",
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: "./query-categories.component.html",
  styleUrl: "./query-categories.component.css",
})
export class QueryCategoriesComponent implements OnInit {
  categories: ServiceCategory[] = [];
  isLoading = false;
  errorMessage = "";

  // Delete Modal State Variables
  showDeleteConfirm = false;
  categoryIdToDelete: number | null = null;
  isDeleting = false;

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

    this.api.post("admin/fetch-services", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res && res.res) {
          this.categories = Array.isArray(res.data) ? res.data : [];
        } else {
          this.errorMessage =
            res.message || "Fehler beim Laden der Kategorien.";
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Ein Verbindungsfehler ist aufgetreten.";
        console.error("Fetch Categories Error:", err);
      },
    });
  }

  // Opens the Tailwind Modal
  promptDelete(id: number): void {
    this.categoryIdToDelete = id;
    this.showDeleteConfirm = true;
  }

  // Closes the Tailwind Modal
  cancelDelete(): void {
    this.showDeleteConfirm = false;
    this.categoryIdToDelete = null;
    this.isDeleting = false;
  }

  // Actually deletes when confirmed in the modal
  confirmDelete(): void {
    if (this.categoryIdToDelete === null) return;

    this.isDeleting = true; // Shows loading spinner in button
    const id = this.categoryIdToDelete;

    const payload = {
      adminId: this.authService.getUserId(),
      serviceId: id,
    };

    this.api.post("admin/remove-customer-service", payload).subscribe({
      next: (res: any) => {
        this.isDeleting = false;
        if (res?.res) {
          this.categories = this.categories.filter((c) => c.serviceId !== id);
          this.cancelDelete(); // Close modal on success
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
