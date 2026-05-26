import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service'; // Adjust path to your actual AuthService

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Read the value of your computed signal
  if (authService.isLoggedIn()) {
    return true; // Allow access to the page
  } else {
    // Redirect to the root page ('') if not logged in
    return router.createUrlTree(['/']); 
  }
};