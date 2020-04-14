import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrderDetailPage} from './order-detail.page';

const routes: Routes = [
    {
        path: '',
        component: OrderDetailPage
    },
    {
        path: 'orderItems',
        loadChildren: () => import('./order-items/order-items.module').then(m => m.OrderItemsPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrderDetailPageRoutingModule {
}
