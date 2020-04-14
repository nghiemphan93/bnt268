import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Order} from '../../../../../../../models/order';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {User} from 'firebase';
import {OrderService} from '../../../../../../../services/order.service';
import {AlertController, Config, Platform} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {AlertService} from '../../../../../../../services/alert.service';
import {ToastService} from '../../../../../../../services/toast.service';
import {AuthService} from '../../../../../../../services/auth.service';
import {UserService} from '../../../../../../../services/user.service';
import {OrderItem} from '../../../../../../../models/orderitem';
import {OrderItemService} from '../../../../../../../services/order-item.service';

@Component({
    selector: 'app-order-items',
    templateUrl: './order-items.page.html',
    styleUrls: ['./order-items.page.scss'],
})
export class OrderItemsPage implements OnInit, OnDestroy {
    subscription = new Subscription();
    orderItemsDesktop$: Observable<OrderItem[]>;
    orderItemsMobile$: Observable<OrderItem[]>[] = [];
    orderItems: OrderItem[] = [];
    tableStyle = 'material';
    isDesktop: boolean;
    isMobile: boolean;
    userId: string;
    orderId: string;
    skeletons = [1, 2];
    editingOrderItem = {};
    customActionSheetOptions: any = {
        header: 'Status',
    };
    @ViewChild('table', {static: false}) table: DatatableComponent;
    currentUser$ = this.authService.getCurrentUser$();
    user$: Observable<User | any>;
    order$: Observable<Order>;
    isAuth$ = this.authService.getIsAuth$();

    constructor(
        private orderService: OrderService,
        private config: Config,
        private platform: Platform,
        private activatedRoute: ActivatedRoute,
        private alertController: AlertController,
        public alertService: AlertService,
        private toastService: ToastService,
        private authService: AuthService,
        private userService: UserService,
        private orderItemService: OrderItemService
    ) {
    }

    ngOnInit() {
        this.setup();
        this.presentToastErrorIfTableNoData();
    }

    ionViewDidEnter() {
        if (this.isDesktop) {
            this.orderItemsDesktop$ = this.orderItemService.getOrderItems(this.userId, this.orderId);
        }
    }


    presentToastErrorIfTableNoData() {
        setTimeout(async () => {
            if (this.table.rowCount === 0) {
                this.table.rowCount = -1;
                await this.toastService.presentToastError('No data or Network error. Please add more data or refresh the page');
            }
        }, 4000);
    }

    ngOnDestroy(): void {
        console.log('bye bye OrdersPage...');

        if (this.orderService.isPageFullyLoaded()) {
            this.orderService.setPageFullyLoaded(false);
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Identify which platform is being used
     */
    private setup() {
        this.userId = this.activatedRoute.snapshot.params.userId;
        this.user$ = this.userService.getUser(this.userId);
        this.orderId = this.activatedRoute.snapshot.params.orderId;
        this.order$ = this.orderService.getOrder(this.userId, this.orderId);
        this.isDesktop = this.platform.is('desktop');
        this.isMobile = !this.platform.is('desktop');
    }

    /**
     * Triggered when content being scrolled 100px above the page's bottom to load for more Order Items
     * @param event: CustomerEvent
     */
    loadData(event: any) {
        if (this.orderService.isPageFullyLoaded()) {
            event.target.disabled = true;
        } else {
            if (this.isMobile) {
                // TODO MOBILE
                event.target.complete();
            } else {
            }
        }
    }

    /**
     * Add new or updated Order Items to this.orderItems based on OrderItem's index
     * @param moreOrderItems: OrderItem[]
     */
    private addPaginatedOrderItems(moreOrderItems: OrderItem[]) {
        if (moreOrderItems.length > 0) {
            const orderIndex = this.orderItems.findIndex(orderItem => orderItem.id === moreOrderItems[0].id);
            if (orderIndex >= 0) {
                console.log('edited order item from block: ' + orderIndex);
            } else {
                console.log('loaded more order items');
            }

            if (orderIndex >= 0) {
                const orderItems = [...this.orderItems];
                orderItems.splice(orderIndex, moreOrderItems.length, ...moreOrderItems);
                this.orderItems = orderItems;
            } else {
                let orderItems = [...this.orderItems];
                orderItems = [...orderItems, ...moreOrderItems];
                this.orderItems = [...orderItems];
            }
        }
    }
}
