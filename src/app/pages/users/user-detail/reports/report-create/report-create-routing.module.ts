import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportCreatePage } from './report-create.page';

const routes: Routes = [
  {
    path: '',
    component: ReportCreatePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportCreatePageRoutingModule {}
