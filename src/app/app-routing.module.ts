import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AngularFireAuthGuard, customClaims, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {pipe} from 'rxjs';
import {map} from 'rxjs/operators';

export const redirectLoggedInToProducts = () => redirectLoggedInTo(['products']);
export const redirectLoggedInToUsers = () => redirectLoggedInTo(['users']);
export const devOnly = () => pipe(customClaims, map(claims => claims.DEV === true));
export const devOrAdminOnly = () => pipe(customClaims, map(claims => (claims.DEV === true) || (claims.ADMIN === true)));
export const redirectNotLoggedInToSignin = () => redirectUnauthorizedTo(['signin']);
export const redirectWorkerToProducts = () => redirectLoggedInTo(['products']);

const routes: Routes = [
    {
        path: '',
        redirectTo: 'signin',
        pathMatch: 'full'
    },
    {
        path: 'signin',
        loadChildren: () => import('./pages/signin/signin.module').then(m => m.SigninPageModule),
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectLoggedInToProducts}
    },
    {
        path: 'users',
        loadChildren: () => import('./pages/users/users.module').then(m => m.UsersPageModule),
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectNotLoggedInToSignin}
    },
    {
        path: 'products',
        loadChildren: () => import('./pages/products/products.module').then(m => m.ProductsPageModule),
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectNotLoggedInToSignin}
    },
    {
        path: '**',
        loadChildren: () => import('./pages/not-found/not-found.module').then(m => m.NotFoundPageModule),
        canActivate: [AngularFireAuthGuard],
        data: {authGuardPipe: redirectNotLoggedInToSignin}
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
