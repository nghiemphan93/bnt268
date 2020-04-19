import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UserDetailEditPage} from './user-detail-edit.page';
import {devOrAdminOnly, redirectNotLoggedInToSignin} from '../../../app-routing.module';
import {AngularFireAuthGuard, redirectUnauthorizedTo} from '@angular/fire/auth-guard';

const routes: Routes = [
    {
        path: '',
        component: UserDetailEditPage,
        // canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: devOrAdminOnly},
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UserDetailEditPageRoutingModule {
}
