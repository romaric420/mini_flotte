import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <div class="login-wrap">
      <div class="card login-card">
        <h1>Mini-Flotte</h1>
        <p class="muted">Gestion de flotte automobile</p>
        <form (ngSubmit)="submit()">
          <label>
            Identifiant
            <input name="username" [(ngModel)]="username" autocomplete="username" required />
          </label>
          <label>
            Mot de passe
            <input name="password" type="password" [(ngModel)]="password" autocomplete="current-password" required />
          </label>
          @if (error()) {
            <p class="error">{{ error() }}</p>
          }
          <button class="btn full" type="submit" [disabled]="loading()">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  username = '';
  password = '';
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(): void {
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.username.trim(), this.password).subscribe({
      next: () => this.router.navigate(['/vehicules']),
      error: (e: HttpErrorResponse) => {
        this.loading.set(false);
        this.error.set(
          e.status === 401
            ? 'Identifiant ou mot de passe incorrect.'
            : 'Serveur injoignable : le back-end est-il démarré ?',
        );
      },
    });
  }
}
