import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrderDetailPageRoutingModule } from './order-detail-routing.module';

import { OrderDetailPage } from './order-detail.page';
import {OrderCreatePageModule} from '../order-create/order-create.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        OrderDetailPageRoutingModule,
        OrderCreatePageModule
    ],
  declarations: [OrderDetailPage]
})
export class OrderDetailPageModule {}
