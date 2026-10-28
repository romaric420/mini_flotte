import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { Maintenance, NewMaintenance, STATUS_LABELS, Vehicle, VehicleStatus, errorMessage } from '../core/models';

@Component({
  selector: 'app-vehicle-detail',
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe, CurrencyPipe],
  template: `
    <a routerLink="/vehicules" class="back">← Retour</a>

    @if (error()) {
      <div class="alert ko">{{ error() }}</div>
    }

    @if (vehicle(); as v) {
      <div class="card">
        <div class="page-head">
          <div>
            <div class="plate">{{ v.plate }}</div>
            <h2>{{ v.brand }} {{ v.model }}</h2>
          </div>
          <span [class]="'status s-' + v.status">{{ labels[v.status] }}</span>
        </div>
        <div class="info-grid">
          <div><span class="muted">Année</span>{{ v.manufactureYear }}</div>
          <div><span class="muted">Énergie</span>{{ v.fuelType }}</div>
          <div><span class="muted">Kilométrage</span>{{ v.mileage | number }} km</div>
          <div><span class="muted">Conducteur</span>{{ v.driverName ?? '—' }}</div>
        </div>

        @if (auth.isAdmin()) {
          <div class="inline">
            <span class="muted">Changer le statut :</span>
            <button class="btn ghost" type="button" (click)="setStatus('AVAILABLE')" [disabled]="v.status === 'AVAILABLE'">Disponible</button>
            <button class="btn ghost" type="button" (click)="setStatus('MAINTENANCE')" [disabled]="v.status === 'MAINTENANCE'">En maintenance</button>
          </div>
        }
      </div>

      <div class="page-head">
        <h3>Historique d'entretien</h3>
        <span class="muted">Total : {{ totalCost() | currency: 'EUR' }}</span>
      </div>

      <div class="card table-wrap">
        <table>
          <thead>
            <tr><th>Date</th><th>Type</th><th>Description</th><th>Km</th><th>Coût</th></tr>
          </thead>
          <tbody>
            @for (m of maintenances(); track m.id) {
              <tr>
                <td>{{ m.date | date: 'dd/MM/yyyy' }}</td>
                <td>{{ m.type }}</td>
                <td>{{ m.description ?? '' }}</td>
                <td>{{ m.mileage === null ? '—' : (m.mileage | number) }}</td>
                <td>{{ m.cost | currency: 'EUR' }}</td>
              </tr>
            } @empty {
              <tr><td colspan="5" class="muted">Aucun entretien enregistré.</td></tr>
            }
          </tbody>
        </table>
      </div>

      @if (auth.isAdmin()) {
        <form class="card form-grid" (ngSubmit)="addMaintenance()">
          <label>Date <input name="date" type="date" [(ngModel)]="newM.date" required /></label>
          <label>
            Type
            <select name="type" [(ngModel)]="newM.type">
              <option>Révision</option>
              <option>Pneus</option>
              <option>Réparation</option>
              <option>Contrôle</option>
            </select>
          </label>
          <label>Description <input name="description" [(ngModel)]="newM.description" /></label>
          <label>Kilométrage <input name="mileage" type="number" [(ngModel)]="newM.mileage" /></label>
          <label>Coût (€) <input name="cost" type="number" step="0.01" [(ngModel)]="newM.cost" required /></label>
          <button class="btn" type="submit">Ajouter l'entretien</button>
        </form>
      }
    }
  `,
})
export class VehicleDetailComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);

  private readonly id = Number(this.route.snapshot.paramMap.get('id'));

  readonly vehicle = signal<Vehicle | null>(null);
  readonly maintenances = signal<Maintenance[]>([]);
  readonly error = signal<string | null>(null);
  readonly labels = STATUS_LABELS;
  readonly totalCost = computed(() => this.maintenances().reduce((sum, m) => sum + Number(m.cost), 0));

  newM: NewMaintenance = this.emptyMaintenance();

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.vehicle(this.id).subscribe({
      next: (v) => this.vehicle.set(v),
      error: (e) => this.error.set(errorMessage(e)),
    });
    this.api.maintenances(this.id).subscribe({
      next: (list) => this.maintenances.set(list),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  setStatus(status: VehicleStatus): void {
    this.api.setStatus(this.id, status).subscribe({
      next: (v) => this.vehicle.set(v),
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  addMaintenance(): void {
    this.api.addMaintenance(this.id, this.newM).subscribe({
      next: () => {
        this.newM = this.emptyMaintenance();
        this.error.set(null);
        this.load();
      },
      error: (e) => this.error.set(errorMessage(e)),
    });
  }

  private emptyMaintenance(): NewMaintenance {
    return { date: new Date().toISOString().slice(0, 10), type: 'Révision', description: '', cost: 0, mileage: null };
  }
}
