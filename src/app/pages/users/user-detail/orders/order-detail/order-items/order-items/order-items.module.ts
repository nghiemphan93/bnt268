import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {OrderItemsPageRoutingModule} from './order-items-routing.module';

import {OrderItemsPage} from './order-items.page';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OrderItemsPageRoutingModule,
        NgxDatatableModule
    ],
    declarations: [OrderItemsPage]
})
export class OrderItemsPageModule {
}
