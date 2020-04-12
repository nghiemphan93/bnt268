import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {TransactionsPage} from './transactions.page';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./transactions/transactions.module').then(m => m.TransactionsPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./transaction-create/transaction-create.module').then(m => m.TransactionCreatePageModule)
    },
    {
        path: ':transactionId',
        loadChildren: () => import('./transaction-detail/transaction-detail.module').then(m => m.TransactionDetailPageModule)
    },
    {
        path: ':transactionId/edit',
        loadChildren: () => import('./transaction-detail-edit/transaction-detail-edit.module').then(m => m.TransactionDetailEditPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class TransactionsPageRoutingModule {
}
