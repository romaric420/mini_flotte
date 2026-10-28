import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/** Page réservée aux utilisateurs connectés. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.user() ? true : router.createUrlTree(['/login']);
};

/** Page réservée au gestionnaire (le back-end vérifie AUSSI : le front ne fait que masquer). */
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isAdmin() ? true : router.createUrlTree(['/vehicules']);
};
