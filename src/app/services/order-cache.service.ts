import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Order} from '../models/order';
import {OrderService} from './order.service';

@Injectable({
    providedIn: 'root'
})
export class OrderCacheService {
    ordersMapSubject = new Map<string, BehaviorSubject<Order[]>>();
    ordersMapCache = new Map<string, Order[]>();

    constructor(private orderService: OrderService) {
        console.log('order service cache created...');
    }

    getOrdersCache$ByUserId(userId: string) {
        if (this.ordersMapCache.has(userId)) {
            console.log(`orders cache from user ${userId} available...`);
            return this.ordersMapSubject.get(userId).asObservable();
        } else {
            console.log(`make HTTP call to get orders of user ${userId}`);
            this.ordersMapSubject.set(userId, new BehaviorSubject<Order[]>([]));
            this.orderService.getOrders(userId).subscribe(ordersFromServer => {
                this.ordersMapSubject.get(userId).next(ordersFromServer);
                this.ordersMapCache.set(userId, ordersFromServer);
            });
            return this.ordersMapSubject.get(userId).asObservable();
        }
    }
}
