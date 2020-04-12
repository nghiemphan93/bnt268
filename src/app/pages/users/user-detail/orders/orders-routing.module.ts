import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrdersPage} from './orders.page';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./orders/orders.module').then(m => m.OrdersPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./order-create/order-create.module').then(m => m.OrderCreatePageModule)
    },
    {
        path: ':orderId',
        loadChildren: () => import('./order-detail/order-detail.module').then(m => m.OrderDetailPageModule)
    },
    {
        path: ':orderId/edit',
        loadChildren: () => import('./order-detail-edit/order-detail-edit.module').then(m => m.OrderDetailEditPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrdersPageRoutingModule {
}
