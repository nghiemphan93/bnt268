import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Order} from '../../../../../models/order';
import {User} from 'firebase';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {OrderService} from '../../../../../services/order.service';
import {AlertController, Config, Platform} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {AlertService} from '../../../../../services/alert.service';
import {ToastService} from '../../../../../services/toast.service';
import {AuthService} from '../../../../../services/auth.service';
import {UserService} from '../../../../../services/user.service';
import {OrderCacheService} from '../../../../../services/order-cache.service';
import {StatusService} from '../../../../../services/status.service';
import {Status} from '../../../../../models/status.enum';

@Component({
    selector: 'app-orders',
    templateUrl: './orders.page.html',
    styleUrls: ['./orders.page.scss'],
})
export class OrdersPage implements OnInit, OnDestroy {
    subscription = new Subscription();
    ordersDesktop$: Observable<Order[]>;
    ordersMobile$: Observable<Order[]>[] = [];
    orders: Order[] = [];
    tableStyle = 'material';
    isDesktop: boolean;
    isMobile: boolean;
    userId: string;
    skeletons = [1, 2];
    editingOrderItem = {};
    customActionSheetOptions: any = {
        header: 'Status',
    };
    @ViewChild('table', {static: false}) table: DatatableComponent;
    currentUser$ = this.authService.getCurrentUser$();
    user$: Observable<User | any>;
    isAuth$ = this.authService.getIsAuth$();
    PENDING = Status.PENDING;
    DONE = Status.DONE;

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
        private orderCacheService: OrderCacheService,
        private statusService: StatusService
    ) {
    }

    ngOnInit() {
        this.setup();
        this.presentToastErrorIfTableNoData();
    }

    ionViewDidEnter() {
        this.ordersDesktop$ = this.orderCacheService.getOrdersCache$ByUserId(this.userId);
        // if (this.isDesktop) {
        //     this.ordersDesktop$ = this.orderCacheService.getOrdersCache$ByUserId(this.userId);
        // }
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
     * @param moreOrder: OrderItem[]
     */
    private addPaginatedOrders(moreOrder: Order[]) {
        if (moreOrder.length > 0) {
            const orderIndex = this.orders.findIndex(orderItem => orderItem.id === moreOrder[0].id);
            if (orderIndex >= 0) {
                console.log('edited order item from block: ' + orderIndex);
            } else {
                console.log('loaded more order items');
            }

            if (orderIndex >= 0) {
                const orders = [...this.orders];
                orders.splice(orderIndex, moreOrder.length, ...moreOrder);
                this.orders = orders;
            } else {
                let orders = [...this.orders];
                orders = [...orders, ...moreOrder];
                this.orders = [...orders];
            }
        }
    }
}
