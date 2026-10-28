import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import {
  FUEL_TYPES,
  NewVehicle,
  STATUS_LABELS,
  User,
  Vehicle,
  VehicleStatus,
  errorMessage,
} from '../core/models';

type Filter = 'ALL' | VehicleStatus;

@Component({
  selector: 'app-vehicles',
  imports: [FormsModule, RouterLink, DecimalPipe],
  template: `
    @if (message()) {
      <div class="alert ok">{{ message() }}</div>
    }
    @if (error()) {
      <div class="alert ko">{{ error() }}</div>
    }

    @if (auth.isAdmin()) {
      <!-- ================= VUE GESTIONNAIRE ================= -->
      <div class="page-head">
        <h2>Flotte</h2>
        <button class="btn" type="button" (click)="showForm.set(!showForm())">
          {{ showForm() ? 'Annuler' : '+ Ajouter un véhicule' }}
        </button>
      </div>

      <div class="stats">
        <div class="stat"><span>{{ stats().total }}</span>Véhicules</div>
        <div class="stat"><span>{{ stats().assigned }}</span>Attribués</div>
        <div class="stat"><span>{{ stats().available }}</span>Disponibles</div>
        <div class="stat"><span>{{ stats().maintenance }}</span>En maintenance</div>
      </div>

      @if (showForm()) {
        <form class="card form-grid" (ngSubmit)="create()">
          <label>Immatriculation <input name="plate" [(ngModel)]="newVehicle.plate" placeholder="AA-123-BB" required /></label>
          <label>Marque <input name="brand" [(ngModel)]="newVehicle.brand" required /></label>
          <label>Modèle <input name="model" [(ngModel)]="newVehicle.model" required /></label>
          <label>Année <input name="year" type="number" [(ngModel)]="newVehicle.manufactureYear" required /></label>
          <label>
            Énergie
            <select name="fuel" [(ngModel)]="newVehicle.fuelType">
              @for (f of fuelTypes; track f) {
                <option [value]="f">{{ f }}</option>
              }
            </select>
          </label>
          <label>Kilométrage <input name="mileage" type="number" [(ngModel)]="newVehicle.mileage" required /></label>
          <button class="btn" type="submit">Enregistrer</button>
        </form>
      }

      <div class="filters">
        @for (f of filters; track f.value) {
          <button type="button" class="chip" [class.active]="filter() === f.value" (click)="filter.set(f.value)">
            {{ f.label }}
          </button>
        }
      </div>

      <div class="card table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Immatriculation</th><th>Véhicule</th><th>Énergie</th>
              <th>Kilométrage</th><th>Statut</th><th>Conducteur</th><th></th>
            </tr>
          </thead>
          <tbody>
            @for (v of filtered(); track v.id) {
              <tr>
                <td>{{ v.id }}</td>
                <td><strong>{{ v.plate }}</strong></td>
                <td>{{ v.brand }} {{ v.model }} ({{ v.manufactureYear }})</td>
                <td>{{ v.fuelType }}</td>
                <td>{{ v.mileage | number }} km</td>
                <td><span [class]="'status s-' + v.status">{{ labels[v.status] }}</span></td>
                <td>
                  <select (change)="onAssign(v, $event)" [disabled]="v.status === 'MAINTENANCE'">
                    <option value="" [selected]="v.driverId === null">— Non attribué —</option>
                    @for (d of drivers(); track d.id) {
                      <option [value]="d.id" [selected]="d.id === v.driverId">{{ d.fullName }}</option>
                    }
                  </select>
                </td>
                <td><a [routerLink]="['/vehicules', v.id]">Détails →</a></td>
              </tr>
            } @empty {
              <tr><td colspan="8" class="muted">Aucun véhicule.</td></tr>
            }
          </tbody>
        </table>
      </div>
    } @else {
      <!-- ================= VUE CONDUCTEUR ================= -->
      <div class="page-head">
        <h2>Mes véhicules</h2>
      </div>
      <div class="cards">
        @for (v of vehicles(); track v.id) {
          <div class="card vehicle-card">
            <div class="plate">{{ v.plate }}</div>
            <h3>{{ v.brand }} {{ v.model }}</h3>
            <p class="muted">{{ v.manufactureYear }} · {{ v.fuelType }}</p>
            <p class="km">{{ v.mileage | number }} km</p>
            <div class="inline">
              <input type="number" [(ngModel)]="mileageInputs[v.id]" placeholder="Nouveau kilométrage" />
              <button class="btn" type="button" (click)="saveMileage(v)">Mettre à jour</button>
            </div>
            <a [routerLink]="['/vehicules', v.id]">Voir l'historique d'entretien →</a>
          </div>
        } @empty {
          <p class="muted">Aucun véhicule ne vous est attribué pour le moment.</p>
        }
      </div>
    }
  `,
})
export class VehiclesComponent implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ApiService);

  readonly vehicles = signal<Vehicle[]>([]);
  readonly drivers = signal<User[]>([]);
  readonly filter = signal<Filter>('ALL');
  readonly showForm = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly labels = STATUS_LABELS;
  readonly fuelTypes = FUEL_TYPES;
  readonly filters: { value: Filter; label: string }[] = [
    { value: 'ALL', label: 'Tous' },
    { value: 'ASSIGNED', label: 'Attribués' },
    { value: 'AVAILABLE', label: 'Disponibles' },
    { value: 'MAINTENANCE', label: 'En maintenance' },
  ];

  newVehicle: NewVehicle = this.emptyVehicle();
  mileageInputs: Record<number, number | null> = {};

  readonly filtered = computed(() => {
    const f = this.filter();
    return f === 'ALL' ? this.vehicles() : this.vehicles().filter((v) => v.status === f);
  });

  readonly stats = computed(() => {
    const list = this.vehicles();
    const count = (s: VehicleStatus) => list.filter((v) => v.status === s).length;
    return {
      total: list.length,
      assigned: count('ASSIGNED'),
      available: count('AVAILABLE'),
      maintenance: count('MAINTENANCE'),
    };
  });

  ngOnInit(): void {
    this.load();
    if (this.auth.isAdmin()) {
      this.api.users().subscribe({
        next: (users) => this.drivers.set(users.filter((u) => u.role === 'DRIVER')),
        error: (e) => this.fail(e),
      });
    }
  }

  load(): void {
    this.api.vehicles().subscribe({
      next: (list) => this.vehicles.set(list),
      error: (e) => this.fail(e),
    });
  }

  onAssign(v: Vehicle, event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const driverId = value ? Number(value) : null;
    this.api.assign(v.id, driverId).subscribe({
      next: (updated) => {
        this.flash(
          updated.driverName
            ? `${updated.plate} attribué à ${updated.driverName}.`
            : `${updated.plate} n'est plus attribué.`,
        );
        this.load();
      },
      error: (e) => {
        this.fail(e);
        this.load();
      },
    });
  }

  create(): void {
    this.api.createVehicle(this.newVehicle).subscribe({
      next: (v) => {
        this.flash(`Véhicule ${v.plate} ajouté.`);
        this.newVehicle = this.emptyVehicle();
        this.showForm.set(false);
        this.load();
      },
      error: (e) => this.fail(e),
    });
  }

  saveMileage(v: Vehicle): void {
    const km = this.mileageInputs[v.id];
    if (km === null || km === undefined) {
      return;
    }
    this.api.updateMileage(v.id, km).subscribe({
      next: (updated) => {
        this.flash(`Kilométrage de ${updated.plate} mis à jour.`);
        this.mileageInputs[v.id] = null;
        this.load();
      },
      error: (e) => this.fail(e),
    });
  }

  private emptyVehicle(): NewVehicle {
    return { plate: '', brand: '', model: '', manufactureYear: new Date().getFullYear(), fuelType: 'Essence', mileage: 0 };
  }

  private flash(text: string): void {
    this.error.set(null);
    this.message.set(text);
    setTimeout(() => this.message.set(null), 3000);
  }

  private fail(e: unknown): void {
    this.message.set(null);
    this.error.set(errorMessage(e));
  }
}
