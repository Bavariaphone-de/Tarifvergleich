import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../shared/services/api.service";
import { AuthService } from "../../shared/services/auth.service";
import { environment } from "../../../environments/environment";

@Component({
  selector: "app-about-us",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./about-us.component.html",
  styleUrl: "./about-us.component.css",
})
export class AboutUsComponent implements OnInit {
  readonly imgBase = environment.imageBaseUrl;

  heading = "";
  nameField = ""; // Mapped to popupContent2
  contactNumber = "";
  emailField = ""; // Mapped to popupContent3
  description = ""; // Dieses Feld wird im Formular als Textarea genutzt

  imageFile: File | null = null;
  imagePreview: string | null = null;
  existingImageUrl: string | null = null;

  isLoading = false;
  errorMessage = "";
  successMessage = "";

  constructor(
    private api: ApiService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  /* ================= DATA LOADING ================= */

  loadInitialData() {
    this.isLoading = true;

    // POST Request zum Laden der Daten
    this.api.post("admin/content", {}).subscribe({
      next: (res: any) => {
        this.isLoading = false;

        if (res.res && res.menu?.about?.length > 0) {
          const aboutData = res.menu.about[0];

          this.heading = aboutData.heading || "";
          this.nameField = aboutData.contactName || "";
          this.contactNumber = aboutData.contactNumber || "";
          this.emailField = aboutData.contactEmail || "";
          // Wir mappen das "subHeading" aus der API in unsere "description" Variable
          this.description = aboutData.subHeading || "";

          if (aboutData.contentUrl) {
            this.existingImageUrl = aboutData.contentUrl;
            this.imagePreview = this.imgBase + aboutData.contentUrl;
          }
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Daten.";
      },
    });
  }

  /* ================= FILE HANDLING ================= */

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      this.errorMessage = "Nur Bilddateien erlaubt";
      event.target.value = ""; // add this line to reset the file input
      return;
    }

    // New 10MB Validation
    if (file.size > 10 * 1024 * 1024) {
      this.errorMessage = "Bild muss kleiner als 10MB sein";
      event.target.value = ""; // Clears the input
      return;
    }

    this.errorMessage = "";
    this.imageFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  /* ================= SUBMIT ================= */

  onSubmit() {
    const adminId = this.authService.getUserId();

    if (
      !this.heading ||
      !this.description ||
      (!this.imageFile && !this.existingImageUrl)
    ) {
      this.errorMessage =
        "Überschrift, Beschreibung und Bild sind erforderlich";
      return;
    }

    this.isLoading = true;
    this.errorMessage = "";
    this.successMessage = "";

    const payload = {
      adminId: adminId,
      heading: this.heading,
      contactName: this.nameField,
      contact: this.contactNumber,
      contactEmail: this.emailField,
      // WICHTIG: Der Key heißt für die API "subHeading", der Wert kommt aus "description"
      subHeading: this.description,
      type: 4,
    };

    const formData = new FormData();

    if (this.imageFile) {
      formData.append("file", this.imageFile);
    }

    formData.append("data", JSON.stringify(payload));

    this.api.post("admin/add-menu", formData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = "Erfolgreich gespeichert";
        this.imageFile = null;
        this.loadInitialData();

        // Hide the success message after 5 seconds
        setTimeout(() => {
          this.successMessage = "";
        }, 5000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Speichern.";
      },
    });
  }
}
