import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UserDetailPage} from './user-detail.page';

const routes: Routes = [
    {
        path: '',
        component: UserDetailPage
    },
    {
        path: 'orders',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UserDetailPageRoutingModule {
}
