import {Injectable} from '@angular/core';
import {AngularFirestore} from '@angular/fire/firestore';
import {AuthService} from './auth.service';
import {Observable} from 'rxjs';
import {Report} from '../models/report';
import {filter, map, takeUntil} from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class ReportService {

    constructor(private afs: AngularFirestore,
                private authService: AuthService) {
        console.log('report service created...');
    }

    getReports(userId: string): Observable<Report[]> {
        const reports = this.afs
            .collection(`users/${userId}/reports`)
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(actions => {
                    console.log('-----------------------------------');
                    actions.forEach(act => console.log(act.payload.doc.data() + ' from cache=' + act.payload.doc.metadata.fromCache + ' type=' + act.payload.type));
                    console.log('-----------------------------------');

                    return actions.map(act => {
                        const data = act.payload.doc.data() as Report;
                        data.id = act.payload.doc.id;
                        return data;
                    });
                })
            );
        return reports;
    }

    getReport(userId: string, reportId: string): Observable<Report> {
        const report = this.afs
            .doc(`users/${userId}/reports/${reportId}`)
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(action => {
                    if (action.payload.exists === false) {
                        return null;
                    } else {
                        const data = action.payload.data() as Report;
                        data.id = action.payload.id;
                        return data;
                    }
                })
            );
        return report;
    }

    async createReport(userId: string, newReport: Report) {
        return await this.afs
            .collection(`users/${userId}/reports`)
            .add({...newReport});
    }

    async createReportByOrderId(userId: string, orderId: string, newReport: Report) {
        return await this.afs
            .doc(`users/${userId}/reports/${orderId}`)
            .set({...newReport});
        // return await this.afs
        //     .collection(`users/${userId}/reports`)
        //     .add({...newReport});
    }

    async updateReport(userId: string, toUpdateReport: Report) {
        return await this.afs
            .doc(`users/${userId}/reports/${toUpdateReport.id}`)
            .update(toUpdateReport);
    }

    async deleteReport(userId: string, toDeleteReport: Report) {
        return await this.afs
            .doc(`users/${userId}/reports/${toDeleteReport.id}`)
            .update(toDeleteReport);
    }
}
