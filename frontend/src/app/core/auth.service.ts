import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { User } from './models';

const TOKEN_KEY = 'flotte.token';
const USER_KEY = 'flotte.user';

/**
 * Gère la connexion. Pour rester simple on utilise HTTP Basic :
 * "identifiant:motdepasse" encodé en Base64 et envoyé à chaque requête.
 * Stocké dans sessionStorage (effacé à la fermeture de l'onglet).
 * ⚠ Pédagogique : en production on utiliserait HTTPS + un jeton JWT/OIDC.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<User | null>(this.readStoredUser());
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN');

  get token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  login(username: string, password: string): Observable<User> {
    const token = 'Basic ' + btoa(`${username}:${password}`);
    return this.http.get<User>('/api/me', { headers: { Authorization: token } }).pipe(
      tap((user) => {
        sessionStorage.setItem(TOKEN_KEY, token);
        sessionStorage.setItem(USER_KEY, JSON.stringify(user));
        this.user.set(user);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  private readStoredUser(): User | null {
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
