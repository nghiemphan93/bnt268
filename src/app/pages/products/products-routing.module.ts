import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./products/products.module').then(m => m.ProductsPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./product-create/product-create.module').then(m => m.ProductCreatePageModule)
    },
    {
        path: ':productId',
        loadChildren: () => import('./product-detail/product-detail.module').then(m => m.ProductDetailPageModule)
    },
    {
        path: ':productId/edit',
        loadChildren: () => import('./product-detail-edit/product-detail-edit.module').then(m => m.ProductDetailEditPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ProductsPageRoutingModule {
}
