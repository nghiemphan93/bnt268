import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportDetailEditPageRoutingModule } from './report-detail-edit-routing.module';

import { ReportDetailEditPage } from './report-detail-edit.page';
import {ReportCreatePageModule} from '../report-create/report-create.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReportDetailEditPageRoutingModule,
        ReportCreatePageModule
    ],
  declarations: [ReportDetailEditPage]
})
export class ReportDetailEditPageModule {}
