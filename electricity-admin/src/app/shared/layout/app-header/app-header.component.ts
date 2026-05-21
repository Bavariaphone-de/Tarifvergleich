import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription, interval } from 'rxjs';
import { SidebarService } from '../../services/sidebar.service';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { UserDropdownComponent } from '../../components/header/user-dropdown/user-dropdown.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterModule,
    UserDropdownComponent,
  ],
  templateUrl: './app-header.component.html',
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  isApplicationMenuOpen = false;
  readonly isMobileOpen$;
  pendingQueriesCount = 0;
  private pollSubscription?: Subscription;
  private refreshSubscription?: Subscription;

  constructor(
    public sidebarService: SidebarService,
    private api: ApiService,
    private authService: AuthService,
    private router: Router,
    private http: HttpClient
  ) {
    this.isMobileOpen$ = this.sidebarService.isMobileOpen$;
  }

  ngOnInit() {
    this.fetchPendingQueriesCount();
    
    // Auto-update the count every 30 seconds (30000 milliseconds)
    this.pollSubscription = interval(30000).subscribe(() => {
      this.fetchPendingQueriesCount();
    });

    // Listen for manual triggers (e.g. when a query is closed)
    this.refreshSubscription = this.api.refreshPendingQueriesCount$.subscribe(() => {
      this.fetchPendingQueriesCount();
    });
  }

  ngOnDestroy() {
    if (this.pollSubscription) {
      this.pollSubscription.unsubscribe();
    }
    if (this.refreshSubscription) {
      this.refreshSubscription.unsubscribe();
    }
  }

  fetchPendingQueriesCount() {
    const payload = {
      adminId: this.authService.getUserId()
    };
    this.http
      .post("http://192.168.0.234:8080/admin/count-open-service-requests", payload)
      .subscribe({
        next: (res: any) => {
          if (res?.res) {
            this.pendingQueriesCount = res.count || 0;
          }
        },
        error: () => {
          console.error("Failed to fetch pending queries count");
        },
      });
  }

  navigateToQueries() {
    this.router.navigate(['/customer-query/customer-queries'], { queryParams: { status: 'open' } });
  }

  handleToggle() {
    if (window.innerWidth >= 1280) {
      this.sidebarService.toggleExpanded();
    } else {
      this.sidebarService.toggleMobileOpen();
    }
  }

  toggleApplicationMenu() {
    this.isApplicationMenuOpen = !this.isApplicationMenuOpen;
  }
}