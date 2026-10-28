import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    @if (auth.user(); as user) {
      <header class="topbar">
        <a class="brand" routerLink="/vehicules">Mini-Flotte</a>
        <nav>
          <a routerLink="/vehicules" routerLinkActive="active">
            {{ auth.isAdmin() ? 'Véhicules' : 'Mes véhicules' }}
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/conducteurs" routerLinkActive="active">Conducteurs</a>
          }
        </nav>
        <div class="who">
          <span>{{ user.fullName }}</span>
          <span class="badge">{{ user.role === 'ADMIN' ? 'Gestionnaire' : 'Conducteur' }}</span>
          <button class="btn ghost" type="button" (click)="logout()">Déconnexion</button>
        </div>
      </header>
    }
    <main class="container">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
