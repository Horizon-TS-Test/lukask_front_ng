import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { InicioComponent } from './components/inicio/inicio.component';
import { ErrorComponent } from './components/error/error.component';
import { AuthGuardService } from './services/auth-guard.service';
import { LoginGuardService } from './services/login-guard.service';
import { ActivityComponent } from './components/activity/activity.component';
import { StreamingComponent } from './components/streaming/streaming.component';
import { StreamGuardService } from './services/stream-guard.service';

const routes: Routes = [
    { pathMatch: 'full', path: '', component: InicioComponent, canActivate: [AuthGuardService] },
    { pathMatch: 'full', path: 'login', component: LoginComponent, canActivate: [LoginGuardService] },
    { pathMatch: 'full', path: 'inicio', component: InicioComponent, canActivate: [AuthGuardService] },
    { pathMatch: 'full', path: 'activity', component: ActivityComponent, canActivate: [AuthGuardService] },
    { pathMatch: 'full', path: 'streaming', component: StreamingComponent, canActivate: [StreamGuardService] }
];

export const appRoutingProviders: any[] = [];
export const routing: ModuleWithProviders = RouterModule.forRoot(routes);
