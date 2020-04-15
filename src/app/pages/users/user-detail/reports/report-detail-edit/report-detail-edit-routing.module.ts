import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportDetailEditPage } from './report-detail-edit.page';

const routes: Routes = [
  {
    path: '',
    component: ReportDetailEditPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportDetailEditPageRoutingModule {}
