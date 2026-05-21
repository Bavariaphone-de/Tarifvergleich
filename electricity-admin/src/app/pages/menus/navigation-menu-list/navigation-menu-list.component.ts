import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ApiService } from "../../../shared/services/api.service";
import { RouterModule } from "@angular/router";
import { AuthService } from "../../../shared/services/auth.service";
import { environment } from "../../../../environments/environment";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-navigation-menu-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./navigation-menu-list.component.html",
})
export class NavigationMenuListComponent implements OnInit {
  readonly imgBase = environment.imageBaseUrl;

  menus: any[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = "";

  // --- Drag & Drop state ---
  dragIndex: number | null = null;
  dropTargetIndex: number | null = null;
  orderChanged = false;

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.fetchMenus();
  }

  fetchMenus() {
    const adminId = this.authService.getUserId();
    this.isLoading = true;
    this.errorMessage = "";

    const payload = { adminId, type: 1 };

    this.api.post("admin/get-all-menu", payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res?.res) {
          // Preserve server-side position if available, else use array index
          this.menus = (res.data || [])
            .map((m: any, i: number) => ({
              ...m,
              position: m.order ?? i,
            }))
            .sort((a: any, b: any) => a.position - b.position);
        } else {
          this.errorMessage = res?.errorMessage || "Failed to load menus";
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = "Something went wrong";
      },
    });
  }

  // ─── Drag & Drop Handlers ──────────────────────────────────────────────────

  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;

    // Set drag data and style the drag ghost
    event.dataTransfer?.setData("text/plain", String(index));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault(); // Required to allow drop
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    // Only update target when hovering a different row
    if (index !== this.dragIndex) {
      this.dropTargetIndex = index;
    }
  }

  onDragLeave(event: DragEvent): void {
    // Only clear if leaving the table entirely (not just between cells)
    const related = event.relatedTarget as HTMLElement | null;
    if (!related?.closest("tr")) {
      this.dropTargetIndex = null;
    }
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();

    const fromIndex = this.dragIndex;

    // No-op: dropped on itself or invalid state
    if (fromIndex === null || fromIndex === dropIndex) {
      this.onDragEnd();
      return;
    }

    // Reorder the menus array
    const reordered = [...this.menus];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);

    // Reassign sequential positions
    this.menus = reordered.map((m, i) => ({ ...m, position: i }));
    this.orderChanged = true;

    this.onDragEnd();
  }

  onDragEnd(): void {
    this.dragIndex = null;
    this.dropTargetIndex = null;
  }

  // ─── Persist Sort Order ────────────────────────────────────────────────────

  saveSortOrder(): void {
    if (this.isSaving) return;

    this.isSaving = true;

    const payload = {
      adminId: this.authService.getUserId(),
      menu: this.menus.map((m) => ({
        id: m.id,
        order: m.position,
      })),
    };

    this.api.post("admin/order-menu", payload).subscribe({
      next: (res) => {
        this.isSaving = false;
        if (res?.res) {
          this.orderChanged = false;
        } else {
          alert(
            res?.errorMessage || "Reihenfolge konnte nicht gespeichert werden",
          );
        }
      },
      error: () => {
        this.isSaving = false;
        alert("Ein Fehler ist aufgetreten beim Speichern der Reihenfolge");
      },
    });
  }

  // ─── Delete ────────────────────────────────────────────────────────────────

  onDelete(id: string): void {
    if (confirm("Möchten Sie dieses Menü wirklich löschen?")) {
      const payload = {
        adminId: this.authService.getUserId(),
        id,
      };

      this.api.post("admin/delete-menu", payload).subscribe({
        next: (res) => {
          if (res?.res) {
            this.menus = this.menus
              .filter((m) => m.id !== id)
              .map((m, i) => ({ ...m, position: i })); // re-index after delete
          } else {
            alert(res?.errorMessage || "Löschen fehlgeschlagen");
          }
        },
        error: () => alert("Ein Fehler ist aufgetreten"),
      });
    }
  }
}
