import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {ProductsPageRoutingModule} from './products-routing.module';

import {ProductsPage} from './products.page';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {AppModule} from '../../../app.module';
import {SharedmoduleModule} from '../../../modules/sharedmodule/sharedmodule.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ProductsPageRoutingModule,
        NgxDatatableModule,
        SharedmoduleModule,
    ],
    declarations: [ProductsPage]
})
export class ProductsPageModule {
}
