import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Maintenance, NewMaintenance, NewVehicle, User, Vehicle, VehicleStatus } from './models';

/** Tous les appels à l'API. Les URL sont relatives (/api/...) : nginx les redirige vers le back-end. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);

  vehicles() {
    return this.http.get<Vehicle[]>('/api/vehicles');
  }

  vehicle(id: number) {
    return this.http.get<Vehicle>(`/api/vehicles/${id}`);
  }

  createVehicle(body: NewVehicle) {
    return this.http.post<Vehicle>('/api/vehicles', body);
  }

  assign(id: number, driverId: number | null) {
    return this.http.put<Vehicle>(`/api/vehicles/${id}/driver`, { driverId });
  }

  setStatus(id: number, status: VehicleStatus) {
    return this.http.put<Vehicle>(`/api/vehicles/${id}/status`, { status });
  }

  updateMileage(id: number, mileage: number) {
    return this.http.patch<Vehicle>(`/api/vehicles/${id}/mileage`, { mileage });
  }

  maintenances(id: number) {
    return this.http.get<Maintenance[]>(`/api/vehicles/${id}/maintenances`);
  }

  addMaintenance(id: number, body: NewMaintenance) {
    return this.http.post<Maintenance>(`/api/vehicles/${id}/maintenances`, body);
  }

  users() {
    return this.http.get<User[]>('/api/users');
  }
}
