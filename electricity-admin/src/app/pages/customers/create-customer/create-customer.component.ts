import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { ApiService } from "../../../shared/services/api.service";

const API_BASE = "http://192.168.0.155:8080";

@Component({
  selector: "app-create-customer",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./create-customer.component.html",
  styleUrl: "./create-customer.component.css",
})
export class CreateCustomerComponent {
  isLoading = false;
  apiError = "";
  successMessage = "";

  customerType: "PRIVATE" | "BUSINESS" = "PRIVATE";

  formData = {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    salutation: "",
    title: "",
    companyName: "",
    mobileNumber: "",
    zip: "",
    city: "",
    street: "",
    houseNumber: "",
  };

  constructor(
    private http: HttpClient,
    private router: Router,
    private api: ApiService,
  ) {}

  createCustomer() {
    this.apiError = "";
    this.successMessage = "";

    const payload = {
      adminId: 1,
      firstName: this.formData.firstName.trim(),
      lastName: this.formData.lastName.trim(),
      email: this.formData.email.trim(),
      password: this.formData.password,

      userType: this.customerType === "BUSINESS" ? "BUSINESS" : "PRIVATE",

      title: this.formData.title || "",
      salutation: this.formData.salutation || "",
      companyName: this.formData.companyName.trim(),

      mobileNumber: "+49" + this.formData.mobileNumber.replace(/\s/g, ""),

      zip: this.formData.zip.trim(),
      city: this.formData.city.trim(),
      street: this.formData.street.trim(),
      houseNumber: this.formData.houseNumber.trim(),
    };

    this.isLoading = true;

    this.api.post(`/admin/add-customer`, payload).subscribe({
      next: (res) => {
        this.isLoading = false;

        if (res.res) {
          this.successMessage = "Customer created successfully";

          setTimeout(() => {
            this.router.navigate(["/customers"]);
          }, 1500);
        } else {
          this.apiError = res.message || "Failed to create customer";
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError = err?.error?.message || "Something went wrong";
      },
    });
  }
}
