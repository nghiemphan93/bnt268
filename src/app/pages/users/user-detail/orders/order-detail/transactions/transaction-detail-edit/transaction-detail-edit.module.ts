import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TransactionDetailEditPageRoutingModule } from './transaction-detail-edit-routing.module';

import { TransactionDetailEditPage } from './transaction-detail-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TransactionDetailEditPageRoutingModule
  ],
  declarations: [TransactionDetailEditPage]
})
export class TransactionDetailEditPageModule {}
