import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UserCreatePage} from './user-create.page';
import {devOrAdminOnly} from '../../../app-routing.module';

const routes: Routes = [
    {
        path: '',
        component: UserCreatePage,
        data: {authGuardPipe: devOrAdminOnly}
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UserCreatePageRoutingModule {
}
