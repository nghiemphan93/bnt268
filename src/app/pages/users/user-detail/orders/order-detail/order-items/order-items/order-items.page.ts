import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {Status} from '../../../../../../../models/status.enum';
import {PlatformService} from '../../../../../../../services/platform.service';

@Component({
    selector: 'app-order-items',
    templateUrl: './order-items.page.html',
    styleUrls: ['./order-items.page.scss'],
})
export class OrderItemsPage implements OnInit, OnDestroy {
    subscription = new Subscription();
    orderItems$: Observable<OrderItem[]>;
    orderItemsMobile$: Observable<OrderItem[]>;
    orderItems: OrderItem[] = [];
    tableStyle = 'material';
    userId: string;
    orderId: string;
    skeletons = [1, 2];
    @ViewChild('table', {static: false}) table: DatatableComponent;
    currentUser$ = this.authService.getCurrentUser$();
    user$: Observable<User | any>;
    order$: Observable<Order>;
    isAuth$ = this.authService.getIsAuth$();
    status = this.statusService.getStatuses();
    GIAO = Kind.GIAO;
    NHAN = Kind.NHẬN;
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
        private orderItemService: OrderItemService,
        private orderItemCacheService: OrderItemCacheService,
        private statusService: StatusService,
        private reportService: ReportService,
        public platformService: PlatformService
    ) {
    }

    ngOnInit() {
        this.setup();
        this.presentToastErrorIfTableNoData();
    }

    ionViewDidEnter() {
        if (this.platformService.isMobile) {
            this.orderItems$ = this.orderItemCacheService.getOrderItemsCache$(this.userId, this.orderId);
        } else {
            this.orderItems$ = this.orderItemCacheService.getOrderItemsCache$(this.userId, this.orderId);
        }
    }


    presentToastErrorIfTableNoData() {
        setTimeout(async () => {
            if ((this.platformService.isDesktop || this.platformService.isTablet) && this.table.rowCount === 0) {
                this.table.rowCount = -1;
                await this.toastService.presentToastError('No data or Network error. Please add more data or refresh the page');
            }
        }, 4000);
    }

    ngOnDestroy(): void {
        console.log('bye bye OrderItemsPage...');

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
    }

    /**
     * Triggered when content being scrolled 100px above the page's bottom to load for more Order Items
     * @param event: CustomerEvent
     */
    loadData(event: any) {
        if (this.orderService.isPageFullyLoaded()) {
            event.target.disabled = true;
        } else {
            if (this.platformService.isMobile) {
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
        console.log('creating report...');
        this.subscription.add(this.orderItems$.subscribe(async orderItemsFromServer => {
            try {
                const newReport = new Report();
                const productQuantityMapper = new Map<string, number>();
                const products: Product[] = [];
                orderItemsFromServer.forEach(orderItem => {
                    switch (orderItem.orderItemKind) {
                        case Kind.GIAO:
                            newReport.giveWeights.push(orderItem.orderItemWeight);
                            newReport.giveWeightsDates.push(orderItem.createdAt);
                            break;
                        case Kind.NHẬN:
                            newReport.receiveWeights.push(orderItem.orderItemWeight);
                            newReport.receiveWeightsDates.push(orderItem.createdAt);

                            for (let i = 0; i < orderItem.orderItemProducts.length; i++) {
                                const product = orderItem.orderItemProducts[i];
                                const productId = orderItem.orderItemProducts[i].id;
                                const productQuantity = orderItem.orderItemQuantities[i];

                                if (product.productName.toLowerCase() === 'bạc dát') {
                                    newReport.totalReceiveBacDatWeight += orderItem.orderItemWeight;
                                    const bacDatWeight = newReport.receiveWeights[newReport.receiveWeights.length - 1];
                                    const bacDatWeightDate = newReport.receiveWeightsDates[newReport.receiveWeightsDates.length - 1];
                                    newReport.receiveBacDatWeights.push(bacDatWeight);
                                    newReport.receiveBacDatWeightsDates.push(bacDatWeightDate);

                                    newReport.receiveWeights.splice(newReport.receiveWeights.length - 1, 1);
                                    newReport.receiveWeightsDates.splice(newReport.receiveWeights.length - 1, 1);
                                }

                                if (product.productName.toLowerCase() === 'bạc tồn') {
                                    newReport.totalReceiveBacTonWeight += orderItem.orderItemWeight;
                                    const bacTonWeight = newReport.receiveWeights[newReport.receiveWeights.length - 1];
                                    const bacTonWeightDate = newReport.receiveWeightsDates[newReport.receiveWeightsDates.length - 1];
                                    newReport.receiveBacTonWeights.push(bacTonWeight);
                                    newReport.receiveBacTonWeightsDates.push(bacTonWeightDate);

                                    newReport.receiveWeights.splice(newReport.receiveWeights.length - 1, 1);
                                    newReport.receiveWeightsDates.splice(newReport.receiveWeights.length - 1, 1);
                                }

                                if (productQuantity > 0) {
                                    if (productQuantityMapper.has(productId)) {
                                        const newTotalQuantity = productQuantityMapper.get(productId) + productQuantity;
                                        productQuantityMapper.set(productId, newTotalQuantity);
                                    } else {
                                        productQuantityMapper.set(productId, productQuantity);
                                        products.push(product);
                                    }
                                }

                            }
                            break;
                    }
                });

                products.forEach(product => {
                    // console.log(`${product.productName} - ${productQuantityMapper.get(product.id)}`);
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

                newReport.totalReceiveWeight = Number(newReport.receiveWeights.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                    return previousValue + currentValue;
                }).toFixed(2));

                newReport.totalReceiveWeightAdjusted = Number((newReport.totalReceiveWeight * 1.05).toFixed(2));

                newReport.totalReceiveWeightAdjustedIncludeBacDatVaTon = Number(newReport.totalReceiveWeightAdjusted + newReport.totalReceiveBacDatWeight + newReport.totalReceiveBacTonWeight).toFixed(2) as unknown as number;

                newReport.totalWeightDifference = Number((newReport.totalGiveWeight - newReport.totalReceiveWeightAdjustedIncludeBacDatVaTon).toFixed(2));
                newReport.createdAt = new Date();

                // console.log(newReport);


                this.order$.subscribe(async orderFromServer => {
                    orderFromServer.orderStatus = Status.DONE;
                    await this.orderService.updateOrder(this.userId, orderFromServer);
                    await this.toastService.presentToastSuccess(`change Status of Order ${orderFromServer.orderName} to DONE successfully`);
                    await this.reportService.createReportByOrderId(this.userId, this.orderId, newReport);
                    await this.toastService.presentToastSuccess(`created Report for Order ${orderFromServer.orderName} successfully`);
                });
            } catch (e) {
                console.log(e);
                await this.toastService.presentToastError(e.message);
            }
        }));
    }
}
