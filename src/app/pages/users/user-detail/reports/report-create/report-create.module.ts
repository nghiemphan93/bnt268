import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ReportCreatePageRoutingModule } from './report-create-routing.module';

import { ReportCreatePage } from './report-create.page';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ReportCreatePageRoutingModule,
        NgxDatatableModule
    ],
    exports: [
        ReportCreatePage
    ],
    declarations: [ReportCreatePage]
})
export class ReportCreatePageModule {}
