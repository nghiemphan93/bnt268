import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrderCreatePage} from './order-create.page';
import {devOrAdminOnly} from '../../../../../app-routing.module';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';

const routes: Routes = [
    {
        path: '',
        component: OrderCreatePage,
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrderCreatePageRoutingModule {
}
