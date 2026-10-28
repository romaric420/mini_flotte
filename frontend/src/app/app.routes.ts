import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards';
import { LoginComponent } from './pages/login.component';
import { VehiclesComponent } from './pages/vehicles.component';
import { VehicleDetailComponent } from './pages/vehicle-detail.component';
import { DriversComponent } from './pages/drivers.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'vehicules', component: VehiclesComponent, canActivate: [authGuard] },
  { path: 'vehicules/:id', component: VehicleDetailComponent, canActivate: [authGuard] },
  { path: 'conducteurs', component: DriversComponent, canActivate: [authGuard, adminGuard] },
  { path: '', pathMatch: 'full', redirectTo: 'vehicules' },
  { path: '**', redirectTo: 'vehicules' },
];
