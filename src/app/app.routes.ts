import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/dashboard'
    },
    {
        path: 'dashboard',
        component: Dashboard
    },
    {
        path: '**',
        redirectTo: '/dashboard'
    }
];
