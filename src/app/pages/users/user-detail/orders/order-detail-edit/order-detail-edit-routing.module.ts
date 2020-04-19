import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {OrderDetailEditPage} from './order-detail-edit.page';
import {devOrAdminOnly} from '../../../../../app-routing.module';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';

const routes: Routes = [
    {
        path: '',
        component: OrderDetailEditPage,
        // canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: devOrAdminOnly},
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class OrderDetailEditPageRoutingModule {
}
