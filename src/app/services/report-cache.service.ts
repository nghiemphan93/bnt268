import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Order} from '../models/order';
import {OrderService} from './order.service';
import {Report} from '../models/report';
import {ReportService} from './report.service';

@Injectable({
    providedIn: 'root'
})
export class ReportCacheService {
    reportsMapSubject = new Map<string, BehaviorSubject<Report[]>>();
    reportsMapCache = new Map<string, Report[]>();

    constructor(private reportService: ReportService) {
        console.log('order service cache created...');
    }

    getReportsCache$ByUserId(userId: string) {
        if (this.reportsMapCache.has(userId)) {
            console.log(`reports cache from user ${userId} available...`);
            return this.reportsMapSubject.get(userId).asObservable();
        } else {
            console.log(`make HTTP call to get reports of user ${userId}`);
            this.reportsMapSubject.set(userId, new BehaviorSubject<Report[]>([]));
            this.reportService.getReports(userId).subscribe(reportsFromServer => {
                this.reportsMapSubject.get(userId).next(reportsFromServer);
                this.reportsMapCache.set(userId, reportsFromServer);
            });
            return this.reportsMapSubject.get(userId).asObservable();
        }
    }
}
