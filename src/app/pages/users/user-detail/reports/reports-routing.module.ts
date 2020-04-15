import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';


const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./reports/reports.module').then(m => m.ReportsPageModule)
    },
    {
        path: 'create',
        loadChildren: () => import('./report-create/report-create.module').then(m => m.ReportCreatePageModule)
    },
    {
        path: ':reportId',
        loadChildren: () => import('./report-detail/report-detail.module').then(m => m.ReportDetailPageModule)
    },
    {
        path: ':reportId/edit',
        loadChildren: () => import('./report-detail-edit/report-detail-edit.module').then(m => m.ReportDetailEditPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ReportsPageRoutingModule {
}
