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
import {OrderItemCacheService} from '../../../../../../../services/order-item-cache.service';
import {StatusService} from '../../../../../../../services/status.service';
import {Report} from '../../../../../../../models/report';
import {Kind} from '../../../../../../../models/kind.enum';
import {Product} from '../../../../../../../models/product';
import {ReportService} from '../../../../../../../services/report.service';

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
    status = this.statusService.getStatuses();

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
        private orderItemService: OrderItemService,
        private orderItemCacheService: OrderItemCacheService,
        private statusService: StatusService,
        private reportService: ReportService
    ) {
    }

    ngOnInit() {
        this.setup();
        this.presentToastErrorIfTableNoData();
    }

    ionViewDidEnter() {
        if (this.isDesktop) {
            this.orderItemsDesktop$ = this.orderItemCacheService.getOrderItemsCache$(this.userId, this.orderId);
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

    prepareReportHandler() {
        this.subscription.add(this.orderItemsDesktop$.subscribe(async orderItemsFromServer => {
            const newReport = new Report();
            const productQuantityMapper = new Map<string, number>();
            const products: Product[] = [];
            orderItemsFromServer.forEach(orderItem => {
                switch (orderItem.orderItemKind) {
                    case Kind.GIAO:
                        newReport.giveWeights.push(orderItem.orderItemWeight);
                        break;
                    case Kind.NHẬN:
                        newReport.receiveWeights.push(orderItem.orderItemWeight);

                        for (let i = 0; i < orderItem.orderItemProducts.length; i++) {
                            const product = orderItem.orderItemProducts[i];
                            const productId = orderItem.orderItemProducts[i].id;
                            const productQuantity = orderItem.orderItemQuantities[i];
                            if (productQuantityMapper.has(productId)) {
                                const newTotalQuantity = productQuantityMapper.get(productId) + productQuantity;
                                productQuantityMapper.set(productId, newTotalQuantity);
                            } else {
                                productQuantityMapper.set(productId, productQuantity);
                                products.push(product);
                            }
                        }
                        break;
                }
            });

            products.forEach(product => {
                console.log(`${product.productName} - ${productQuantityMapper.get(product.id)}`);
                newReport.products.push(product);
                newReport.quantities.push(productQuantityMapper.get(product.id));
                newReport.totalPricePerProduct.push(product.productPrice * productQuantityMapper.get(product.id));
            });

            newReport.totalPrice = newReport.totalPricePerProduct.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                return previousValue + currentValue;
            });

            newReport.totalGiveWeight = newReport.giveWeights.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                return previousValue + currentValue;
            });

            newReport.totalReceiveWeight = newReport.receiveWeights.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                return previousValue + currentValue;
            });

            newReport.totalReceiveWeightAdjusted = newReport.totalReceiveWeight * 1.05;

            newReport.weightDifference = newReport.totalGiveWeight - newReport.totalReceiveWeightAdjusted;
            newReport.createdAt = new Date();

            console.log(newReport);

            try {
                await this.reportService.createReportByOrderId(this.userId, this.orderId, newReport);
            } catch (e) {
                console.log(e);
                await this.toastService.presentToastError(e.message);
            }
        }));
    }
}
