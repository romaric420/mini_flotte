import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { ApiService } from '../core/api.service';
import { User, Vehicle, errorMessage } from '../core/models';

@Component({
  selector: 'app-drivers',
  template: `
    <div class="page-head">
      <h2>Utilisateurs</h2>
    </div>
    @if (error()) {
      <div class="alert ko">{{ error() }}</div>
    }
    <div class="card table-wrap">
      <table>
        <thead>
          <tr><th>ID</th><th>Identifiant</th><th>Nom</th><th>E-mail</th><th>Rôle</th><th>Véhicules</th></tr>
        </thead>
        <tbody>
          @for (u of users(); track u.id) {
            <tr>
              <td>{{ u.id }}</td>
              <td><code>{{ u.username }}</code></td>
              <td>{{ u.fullName }}</td>
              <td>{{ u.email }}</td>
              <td><span class="badge">{{ u.role === 'ADMIN' ? 'Gestionnaire' : 'Conducteur' }}</span></td>
              <td>
                @for (v of vehiclesOf(u.id); track v.id) {
                  <span class="plate small">{{ v.plate }}</span>
                } @empty {
                  <span class="muted">—</span>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class DriversComponent implements OnInit {
  private readonly api = inject(ApiService);

  readonly users = signal<User[]>([]);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    forkJoin({ users: this.api.users(), vehicles: this.api.vehicles() }).subscribe({
      next: ({ users, vehicles }) => {
        this.users.set(users);
        this.vehicles.set(vehicles);
      },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  vehiclesOf(userId: number): Vehicle[] {
    return this.vehicles().filter((v) => v.driverId === userId);
  }
}
