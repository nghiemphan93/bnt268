import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrderDetailPage} from './order-detail.page';

const routes: Routes = [
    {
        path: '',
        component: OrderDetailPage
    },
    {
        path: 'transactions',
        loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrderDetailPageRoutingModule {
}
