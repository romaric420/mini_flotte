export type Role = 'ADMIN' | 'DRIVER';
export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'MAINTENANCE';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: Role;
  vehicleCount: number;
}

export interface Vehicle {
  id: number;
  plate: string;
  brand: string;
  model: string;
  manufactureYear: number;
  fuelType: string;
  mileage: number;
  status: VehicleStatus;
  driverId: number | null;
  driverName: string | null;
}

export interface NewVehicle {
  plate: string;
  brand: string;
  model: string;
  manufactureYear: number;
  fuelType: string;
  mileage: number;
}

export interface Maintenance {
  id: number;
  date: string;
  type: string;
  description: string | null;
  cost: number;
  mileage: number | null;
}

export interface NewMaintenance {
  date: string;
  type: string;
  description: string;
  cost: number;
  mileage: number | null;
}

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  AVAILABLE: 'Disponible',
  ASSIGNED: 'Attribué',
  MAINTENANCE: 'En maintenance',
};

export const FUEL_TYPES = ['Essence', 'Diesel', 'Hybride', 'Électrique'];

/** Transforme une erreur HTTP en message lisible (le back renvoie un JSON avec "detail"). */
export function errorMessage(err: unknown): string {
  const e = err as { status?: number; error?: { detail?: string } };
  if (e?.error?.detail) {
    return e.error.detail;
  }
  if (e?.status === 0) {
    return 'Serveur injoignable.';
  }
  if (e?.status === 403) {
    return 'Action non autorisée.';
  }
  return 'Une erreur est survenue.';
}
