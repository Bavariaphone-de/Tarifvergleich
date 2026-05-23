import { Component } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { CKEditorModule } from "@ckeditor/ckeditor5-angular";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { ApiService } from "../../../shared/services/api.service";
import { ActivatedRoute } from "@angular/router";
import { Router } from "@angular/router";

@Component({
  selector: "app-email-requests",
  imports: [FormsModule, CommonModule, CKEditorModule],
  standalone: true,
  templateUrl: "./email-requests.component.html",
  styleUrl: "./email-requests.component.css",
})
export class EmailRequestsComponent {
  selectedCategory: string = "";
  title: string = "";
  subtitle: string = "";
  emailContent: string = "";
  Editor = ClassicEditor;

  pdfList: any[] = [];
  selectedPdfIds: Set<number> = new Set();
  isPdfDropdownOpen: boolean = false;
  message: string = "";
  isError: boolean = false;

  isEditMode = false;
  managementId: any;

  categories: any[] = [];

  constructor(
    private http: HttpClient,
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.api
      .post("email-category/all", { adminId: 1 })
      .subscribe((res: any) => {
        console.log(res);
        this.categories = res;
      });

    this.loadPdfs();

    this.managementId = this.route.snapshot.paramMap.get('id');

      if (this.managementId) {

        this.isEditMode = true;

        this.http.get(
          `http://192.168.0.155:8080/admin/email-management/${this.managementId}`
        )
        .subscribe((res: any) => {

          console.log(res);

          this.title = res.title;
          this.subtitle = res.subtitle;
          this.emailContent = res.emailContent;

          this.selectedCategory = res.category?.cateId;
        });
      }
  }

  loadPdfs() {
    const payload = {
      adminId: 1,
      page: 0,
      size: 100,
    };
    this.api
      .post("admin/fetch-admin-documents", payload)
      .subscribe({
        next: (res) => {
          console.log(res);
          this.pdfList = res.data || res.content || res;
        },
        error: (err) => {
          console.log(err);
        },
      });
  }

  togglePdfDropdown() {
    this.isPdfDropdownOpen = !this.isPdfDropdownOpen;
  }

  closePdfDropdown() {
    this.isPdfDropdownOpen = false;
  }

  togglePdfSelection(pdfId: number) {
    if (this.selectedPdfIds.has(pdfId)) {
      this.selectedPdfIds.delete(pdfId);
    } else {
      this.selectedPdfIds.add(pdfId);
    }
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

  // Strips HTML tags and &nbsp; only for empty-check — original content is never modified
  private isEditorEmpty(html: string): boolean {
    const stripped = html
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, "")
      .trim();
    return stripped.length === 0;
  }

  submitForm() {

    if (this.isEditMode) {
      this.updateTemplate();

      return;
    }

    if (
      !this.selectedCategory ||
      !this.title.trim() ||
      this.isEditorEmpty(this.emailContent)
    ) {
      this.message = "Please fill all mandatory fields";
      this.isError = true;

      setTimeout(() => {
        this.message = "";
      }, 3000);

      return;
    }

    // emailContent is sent as-is — preserves all admin formatting from CKEditor
    const body = {
      adminId: 1,
      title: this.title,
      subtitle: this.subtitle,
      emailContent: this.emailContent,
      cateId: this.selectedCategory,
      pdfIds: Array.from(this.selectedPdfIds),
    };

    this.http
      .post("http://192.168.0.155:8080/admin/email-management/save", body)
      .subscribe({
        next: (res) => {
          this.message = "Successfully Submitted";
          this.isError = false;

          this.title = "";
          this.subtitle = "";
          this.emailContent = "";
          this.selectedCategory = "";
          this.selectedPdfIds = new Set();

          setTimeout(() => {
            this.message = "";
          }, 3000);
        },
        error: (err) => {
          console.log(err);
          this.message = "Submission Failed";
          this.isError = true;

          setTimeout(() => {
            this.message = "";
          }, 3000);
        },
      });
  }

  // FOR EDITING TEMPLATE

  updateTemplate() {
      const body = {
        adminId: 1,
        title: this.title,
        subtitle: this.subtitle,
        emailContent: this.emailContent,
        cateId: this.selectedCategory,
        pdfIds: Array.from(this.selectedPdfIds),
      };

      this.http.put(
        `http://192.168.0.155:8080/admin/email-management/update/${this.managementId}`,
        body
      )
      .subscribe({
        next: () => {

          this.message = "Successfully Updated";
          this.isError = false;

          setTimeout(() => {
            this.message = "";
          }, 3000);

        },
        error: (err) => {

          console.log(err);

          this.message = "Update Failed";
          this.isError = true;

          setTimeout(() => {
            this.message = "";
          }, 3000);

        }
      });
    }

  cancelForm() {
    this.selectedCategory = "";
    this.title = "";
    this.subtitle = "";
    this.emailContent = "";
    this.selectedPdfIds = new Set();
    this.message = "";

    this.router.navigate(["/email-template"]);
  }

  copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => {
      this.message = `"${text}" copied to clipboard!`;
      this.isError = false;
      setTimeout(() => {
        this.message = "";
      }, 2000);
    });
  }
}
