import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {OrderItem} from '../models/orderitem';
import {OrderItemService} from './order-item.service';

@Injectable({
    providedIn: 'root'
})
export class OrderItemCacheService {
    orderItemsMapSubjects = new Map<string, BehaviorSubject<OrderItem[]>>();
    orderItemsMapCache = new Map<string, OrderItem[]>();

    constructor(private orderItemService: OrderItemService) {
        console.log('order item cache service created...');
    }

    getOrderItemsCache$(userId: string, orderId: string): Observable<OrderItem[]> {
        if (this.orderItemsMapCache.has(orderId)) {
            console.log(`order items cache from Order ${orderId} available...`);
            return this.orderItemsMapSubjects.get(orderId).asObservable();
        } else {
            console.log(`make HTTP call to get Order Items for Order ${orderId}`);
            this.orderItemsMapSubjects.set(orderId, new BehaviorSubject<OrderItem[]>([]));
            this.orderItemService.getOrderItems(userId, orderId).subscribe(orderItemsFromServer => {
                this.orderItemsMapSubjects.get(orderId).next(orderItemsFromServer);
                this.orderItemsMapCache.set(orderId, orderItemsFromServer);
            });
            return this.orderItemsMapSubjects.get(orderId).asObservable();
        }
    }
}
