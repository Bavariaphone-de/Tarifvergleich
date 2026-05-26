import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RouteClearService {
  constructor(
    private router: Router,
    private authService: AuthService,
  ) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const keepRoutes = ['/electricity-comparision'];

        const currentUrl = event.urlAfterRedirects;

        const shouldKeepAddress = keepRoutes.some((route) => currentUrl.startsWith(route));

        // CLEAR ON ALL OTHER PAGES
        if (!shouldKeepAddress) {
          this.authService.clearAddress();
        }
      });
  }
}
