import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { Subject, Subscription } from "rxjs";
import { debounceTime, distinctUntilChanged } from "rxjs/operators";
import { ApiService } from "../../shared/services/api.service";
import { AuthService } from "../../shared/services/auth.service";


// ── Nested types ────────────────────────────────────────────────

type ComparisonCustomer = {
  id?: number | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  userType?: string | null;
  title?: string | null;
  salutation?: string | null;
};

type BaseRate = {
  rateId?: number | null;
  rateName?: string | null;
  workPrice?: number | null;
  workPriceNt?: number | null;
  basePriceYear?: number | null;
  basePriceMonth?: number | null;
};

type BaseProvider = {
  providerId?: number | null;
  providerName?: string | null;
  rates?: BaseRate[] | null;
};

type EnergyRate = {
  rateId?: number | null;
  rateName?: string | null;
  providerId?: number | null;
  providerName?: string | null;
  providerSVG?: string | null;
  providerSVGPath?: string | null;
  branch?: string | null;
  type?: string | null;
  workPrice?: number | null;
  workPriceNt?: number | null;
  basePriceYear?: number | null;
  basePriceMonth?: number | null;
  totalPrice?: number | null;
  totalPriceMonth?: number | null;
  savingPerYear?: number | null;
  optEco?: boolean | null;
  optBonus?: number | null;
  optTerm?: string | null;
  optGuarantee?: string | null;
  optGuaranteeType?: string | null;
  cancel?: number | null;
  recommended?: boolean | null;
  selfPayment?: boolean | null;
  requiredEmail?: boolean | null;
  partialPayment?: number | null;
  rateChangeType?: string[] | null;
  termBeforeNewType?: string | null;
  termBeforeNewMaxDate?: string | null;
  netzProviderId?: number | null;
  expanded?: boolean;
};

type BaseProviderResponse = {
  result?: BaseProvider[] | null;
};

type EnergyRateResponse = {
  total?: number | null;
  result?: EnergyRate[] | null;
};

export type ComparisonEntry = {
  [x: string]: any;
  id?: number | null;
  zip?: string | null;
  city?: string | null;
  street?: string | null;
  houseNumber?: string | null;
  consumption?: string | null;
  consumerType?: string | null;
  branch?: string | null;
  customer?: ComparisonCustomer | null;
  comparedOn?: number | null;
  requestIp?: string | null;
  requestDeviceDetails?: string | null;
  baseProviderResponse?: BaseProviderResponse | null;
  energyRateResponse?: EnergyRateResponse | null;
  adminId?: number | null;
  rateType?: string | number | null;
};

@Component({
  selector: "app-comparison-list",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./customer-comparison.component.html",
  styleUrl: "./customer-comparison.component.css",
})
export class ComparisonListComponent implements OnInit, OnDestroy {
  comparisons: ComparisonEntry[] = [];
  isLoading = false;
  errorMessage = "";
  selectedEntry: ComparisonEntry | null = null;
  isSidebarOpen = false;
  activeRateTab: "base" | "results" = "results";

  // ── Pagination ──────────────────────────────────────────────
  hasMoreData = true;
  currentPage = 1;
  totalCount = 0; // total records from API
  totalPages = 1; // computed from totalCount / PAGE_LIMIT
  totalComparisons = 0; // total comparisons (if different from totalCount)
  private readonly PAGE_LIMIT = 20;

  // ── Search ──────────────────────────────────────────────────
  searchTerm = "";
  private searchTerm$ = new Subject<string>();
  private searchSub!: Subscription;

  // ── Filter ────────────────────────────────────────────────────
  filterType = "";

  constructor(
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Debounce search input: wait 350 ms after last keystroke, skip unchanged values
    this.searchSub = this.searchTerm$
      .pipe(debounceTime(350), distinctUntilChanged())
      .subscribe(() => this.applyFiltersAndPagination(1));

    this.fetchComparisons();
  }

  ngOnDestroy(): void {
    this.searchSub?.unsubscribe();
  }

  allComparisons: ComparisonEntry[] = [];

  onSearchInput(value: string): void {
    this.searchTerm = value;
    this.searchTerm$.next(value);
  }

  clearSearch(): void {
    this.searchTerm = "";
    this.searchTerm$.next("");
  }

  onFilterChange(): void {
    this.applyFiltersAndPagination(1);
  }

  // ── Data fetching ────────────────────────────────────────────

  fetchComparisons(): void {
    // Fetch all records by omitting page and limit
    const payload = {
      adminId: this.authService.getUserId(),
    };
    this.isLoading = true;
    this.errorMessage = "";
    this.closeSidebar();

    this.api.post("admin/fetch-customer-comparisons", payload).subscribe({
      next: (res: any) => {
        this.isLoading = false;
        this.allComparisons = this.extractList(res);
        this.totalComparisons = this.allComparisons.length;
        this.applyFiltersAndPagination(this.currentPage);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = "Fehler beim Laden der Vergleichsliste.";
        console.error("Comparison list fetch error:", err);
      },
    });
  }

  applyFiltersAndPagination(page: number): void {
    let filtered = this.allComparisons;

    // Search filter (client-side)
    if (this.searchTerm) {
      const s = this.searchTerm.toLowerCase();
      filtered = filtered.filter(entry => {
        const idMatch = entry.id?.toString().includes(s);
        const emailMatch = entry.customer?.email?.toLowerCase().includes(s);
        const zipMatch = entry.zip?.toLowerCase().includes(s);
        const cityMatch = entry.city?.toLowerCase().includes(s);
        const nameMatch = this.customerFullName(entry.customer).toLowerCase().includes(s);
        return idMatch || emailMatch || zipMatch || cityMatch || nameMatch;
      });
    }

    // Dropdown filter
    if (this.filterType) {
      filtered = filtered.filter(entry => {
        const clryf = this.getRateTypeLabel(entry.rateType, entry.branch);
        switch (this.filterType) {
          case 'strom': return clryf === 'Strom';
          case 'gas': return clryf === 'Gas';
          case 'heizstrom-waermepumpe': return clryf === 'Heizstrom | Wärmepumpe';
          case 'heizstrom-nachtspeicher': return clryf === 'Heizstrom | Nachtspeicher';
          case 'ladestrom': return clryf === 'Ladestrom | Autostrom';
          default: return true;
        }
      });
    }

    // Pagination metrics
    this.totalCount = filtered.length;
    this.totalPages = Math.max(1, Math.ceil(this.totalCount / this.PAGE_LIMIT));

    if (page > this.totalPages) page = this.totalPages;
    if (page < 1) page = 1;
    this.currentPage = page;

    // Slice for current page
    const startIndex = (this.currentPage - 1) * this.PAGE_LIMIT;
    this.comparisons = filtered.slice(startIndex, startIndex + this.PAGE_LIMIT);
    this.hasMoreData = this.currentPage < this.totalPages;
  }

  nextPage(): void {
    if (this.hasMoreData) this.applyFiltersAndPagination(this.currentPage + 1);
  }

  prevPage(): void {
    if (this.currentPage > 1) this.applyFiltersAndPagination(this.currentPage - 1);
  }

  // ── Pagination display helpers ───────────────────────────────

  /** First record number on current page, e.g. 21 */
  get pageRangeFrom(): number {
    return this.totalCount === 0 ? 0 : (this.currentPage - 1) * this.PAGE_LIMIT + 1;
  }

  /** Last record number on current page, e.g. 40 */
  get pageRangeTo(): number {
    return Math.min(this.currentPage * this.PAGE_LIMIT, this.totalCount);
  }

  // ── Sidebar ──────────────────────────────────────────────────

  openSidebar(entry: ComparisonEntry): void {
    if (this.selectedEntry?.id === entry.id) {
      this.closeSidebar();
      return;
    }
    this.selectedEntry = entry;
    this.isSidebarOpen = true;
    this.activeRateTab = "results";
  }

  closeSidebar(): void {
    this.isSidebarOpen = false;
    this.selectedEntry = null;
  }

  isSelected(entry: ComparisonEntry): boolean {
    return this.selectedEntry?.id === entry.id;
  }

  setTab(tab: "base" | "results"): void {
    this.activeRateTab = tab;
  }

  // ── Admin: continue contract ─────────────────────────────────

  /**
   * Opens the tariff/order flow pre-filled with the data from this comparison,
   * acting on behalf of the customer (or as admin for a guest).
   *
   * Adjust the route and query-param names to match your actual order flow.
   */
  continueAsAdmin(entry: ComparisonEntry): void {
    if (!entry.id) return;
    this.router.navigate(["/admin/order/new"], {
      queryParams: {
        comparisonId: entry.id,
        customerId: entry.customer?.id ?? null,
        adminMode: true,
      },
    });
  }

  // ── Customer helpers ─────────────────────────────────────────

  isLoggedIn(entry: ComparisonEntry): boolean {
    return !!entry.customer?.id && entry.customer.id !== 0;
  }

  customerFullName(c?: ComparisonCustomer | null): string {
    if (!c) return "Gast";
    return (
      [c.title, c.firstName, c.lastName].filter(Boolean).join(" ").trim() ||
      "Gast"
    );
  }

  customerInitials(c?: ComparisonCustomer | null): string {
    if (!c) return "G";
    const f = c.firstName?.[0] ?? "";
    const l = c.lastName?.[0] ?? "";
    return (f + l).toUpperCase() || "G";
  }

  // ── Device / IP helpers ──────────────────────────────────────

  parseDevice(raw?: string | null): string {
    if (!raw) return "—";
    return raw
      .replace(/[{}]/g, "")
      .split(",")
      .map((p) => p.split("=")[1]?.trim())
      .filter(Boolean)
      .join(" · ");
  }

  // ── Address helpers ──────────────────────────────────────────

  formatAddress(entry: ComparisonEntry): string {
    const parts = [
      entry.street && entry.houseNumber
        ? `${entry.street} ${entry.houseNumber}`
        : entry.street,
      entry.zip && entry.city ? `${entry.zip} ${entry.city}` : entry.city,
    ].filter(Boolean);
    return parts.join(", ") || "—";
  }

  // ── Provider helpers ─────────────────────────────────────────

  baseProviders(entry: ComparisonEntry): BaseProvider[] {
    return entry.baseProviderResponse?.result ?? [];
  }

  energyRates(entry: ComparisonEntry): EnergyRate[] {
    return entry.energyRateResponse?.result ?? [];
  }

  rateCount(entry: ComparisonEntry): number {
    return (
      entry.energyRateResponse?.total ??
      entry.energyRateResponse?.result?.length ??
      0
    );
  }

  bestRate(entry: ComparisonEntry): EnergyRate | null {
    const rates = this.energyRates(entry);
    if (!rates.length) return null;
    return [...rates].sort(
      (a, b) => (a.totalPrice ?? 9999) - (b.totalPrice ?? 9999),
    )[0];
  }

  rateChangeTypeLabel(types?: string[] | null): string {
    if (!types?.length) return "—";
    const map: Record<string, string> = {
      NEW: "Neu",
      CHANGE: "Wechsel",
      MODIFICATION: "Änderung",
    };
    return types.map((t) => map[t] ?? t).join(", ");
  }

  getRateTypeLabel(rateType?: string | number | null, branch?: string | null): string {
    if (rateType === undefined || rateType === null || rateType === "") return "—";
    const val = String(rateType);
    if (val === '0') return branch === 'electric' ? 'Strom' : 'Gas';
    if (val === '1') return 'Heizstrom | Wärmepumpe';
    if (val === '2') return 'Heizstrom | Nachtspeicher';
    if (val === '3') return 'Ladestrom | Autostrom';
    return val;
  }

  // ── Date helpers ─────────────────────────────────────────────

  formatDate(value?: number | string | null): string {
    if (value === null || value === undefined || value === "") return "—";
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return String(value);
    const ms = num < 1_000_000_000_000 ? num * 1000 : num;
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(ms));
  }

  formatDateTime(value?: number | string | null): string {
    if (value === null || value === undefined || value === "") return "—";
    const num = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(num)) return String(value);
    const ms = num < 1_000_000_000_000 ? num * 1000 : num;
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(ms));
  }

  private extractList(response: any): ComparisonEntry[] {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response)) return response;
    return [];
  }
}
