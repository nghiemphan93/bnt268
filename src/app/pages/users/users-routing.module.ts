import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {UsersPage} from './users.page';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./users/users.module').then(m => m.UsersPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./user-create/user-create.module').then(m => m.UserCreatePageModule)
    },
    {
        path: ':userId',
        loadChildren: () => import('./user-detail/user-detail.module').then(m => m.UserDetailPageModule)
    },
    {
        path: ':userId/edit',
        loadChildren: () => import('./user-detail-edit/user-detail-edit.module').then(m => m.UserDetailEditPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UsersPageRoutingModule {
}
