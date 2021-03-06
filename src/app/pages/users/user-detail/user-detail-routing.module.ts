import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UserDetailPage} from './user-detail.page';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';

const routes: Routes = [
    {
        path: '',
        component: UserDetailPage,
    },
    {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule)
    },
    {
        path: 'reports',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UserDetailPageRoutingModule {
}
