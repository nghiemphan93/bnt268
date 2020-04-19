import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UsersPage} from './users.page';
import {devOrAdminOnly, redirectLoggedInToProducts, redirectWorkerToProducts} from '../../../app-routing.module';
import {AngularFireAuthGuard} from '@angular/fire/auth-guard';

const routes: Routes = [
    {
        path: '',
        component: UsersPage,
        data: {authGuardPipe: devOrAdminOnly}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersPageRoutingModule {
}
