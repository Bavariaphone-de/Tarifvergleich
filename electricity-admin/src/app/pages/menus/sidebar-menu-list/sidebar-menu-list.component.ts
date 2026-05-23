import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";
import { AuthService } from "../../../shared/services/auth.service";
import { environment } from "../../../../environments/environment.development";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-sidebar-menu-list",
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: "./sidebar-menu-list.component.html",
  styleUrl: "./sidebar-menu-list.component.css",
})
export class SidebarMenuListComponent implements OnInit {
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

  ngOnInit(): void {
    this.fetchSidebarMenus();
  }

  fetchSidebarMenus(): void {
    const adminId = this.authService.getUserId();
    this.isLoading = true;
    this.errorMessage = "";

    const payload = { adminId, type: 2 };

    this.api.post("admin/get-all-menu", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        if (res?.res && res.data) {
          // Preserve server-side position if available, else fall back to array index
          this.menus = res.data
            .map((m: any, i: number) => ({
              ...m,
              position: m.order ?? i,
            }))
            .sort((a: any, b: any) => a.position - b.position);
        } else {
          this.menus = [];
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Menüs";
        console.error("Fetch error:", err);
      },
    });
  }

  // ─── Drag & Drop Handlers ──────────────────────────────────────────────────

  onDragStart(event: DragEvent, index: number): void {
    this.dragIndex = index;
    event.dataTransfer?.setData("text/plain", String(index));
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = "move";
    }
  }

  onDragOver(event: DragEvent, index: number): void {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "move";
    }
    if (index !== this.dragIndex) {
      this.dropTargetIndex = index;
    }
  }

  onDragLeave(event: DragEvent): void {
    const related = event.relatedTarget as HTMLElement | null;
    if (!related?.closest("tr")) {
      this.dropTargetIndex = null;
    }
  }

  onDrop(event: DragEvent, dropIndex: number): void {
    event.preventDefault();

    const fromIndex = this.dragIndex;

    if (fromIndex === null || fromIndex === dropIndex) {
      this.onDragEnd();
      return;
    }

    const reordered = [...this.menus];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(dropIndex, 0, moved);

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

    this.api
      .post("admin/order-menu", payload)
      .subscribe({
        next: (res: any) => {
          this.isSaving = false;
          if (res?.res) {
            this.orderChanged = false;
          } else {
            alert(
              res?.errorMessage ||
                "Reihenfolge konnte nicht gespeichert werden",
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

  onDelete(id: number): void {
    if (confirm("Möchten Sie dieses Sidebar-Menü wirklich löschen?")) {
      const payload = {
        adminId: this.authService.getUserId(),
        id,
      };

      this.api.post("admin/delete-menu", payload).subscribe({
        next: (res: any) => {
          if (res?.res) {
            this.menus = this.menus
              .filter((m) => m.id !== id)
              .map((m, i) => ({ ...m, position: i })); // re-index after delete
          } else {
            alert(res?.errorMessage || "Fehler beim Löschen");
          }
        },
        error: () => alert("Ein Fehler ist aufgetreten"),
      });
    }
  }
}
