import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportDetailEditPageRoutingModule } from './report-detail-edit-routing.module';

import { ReportDetailEditPage } from './report-detail-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReportDetailEditPageRoutingModule
  ],
  declarations: [ReportDetailEditPage]
})
export class ReportDetailEditPageModule {}
