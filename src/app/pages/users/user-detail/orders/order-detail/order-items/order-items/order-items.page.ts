import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {Order} from '../../../../../../../models/order';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {User} from 'firebase';
import {OrderService} from '../../../../../../../services/order.service';
import {AlertController, Config, Platform} from '@ionic/angular';
import {ActivatedRoute, Router} from '@angular/router';
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
import {ProductService} from '../../../../../../../services/product.service';
import {ProductCacheService} from '../../../../../../../services/product-cache.service';
import * as _ from 'lodash';
import {LoadingService} from '../../../../../../../services/loading.service';

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
    tableStyle = 'material striped';
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
        public platformService: PlatformService,
        private productService: ProductService,
        private productCacheService: ProductCacheService,
        private router: Router,
        private loadingService: LoadingService
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
            this.configOrderItemsTableSize();
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

    async prepareReportHandler() {
        console.log('creating report...');
        await this.loadingService.presentLoading();
        this.subscription.add(this.productCacheService.getProductsCache$().subscribe(async productsFromServer => {
            this.subscription.add(this.orderItems$.subscribe(async orderItemsFromServer => {
                try {
                    if (productsFromServer.length > 0) {
                        const newReport = new Report();
                        const productQuantityMapper = new Map<string, number>();
                        let products: Product[] = [];
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

                                        const product = productsFromServer.find(productTemp => productTemp.id === orderItem.orderItemProducts[i].id);
                                        const productId = orderItem.orderItemProducts[i].id;
                                        const productQuantity = orderItem.orderItemQuantities[i];
                                        try {
                                            if (product.productName.toLowerCase().includes('bạc dát')) {
                                                newReport.totalReceiveBacDatWeight += orderItem.orderItemWeight;
                                                const bacDatWeight = newReport.receiveWeights[newReport.receiveWeights.length - 1];
                                                const bacDatWeightDate = newReport.receiveWeightsDates[newReport.receiveWeightsDates.length - 1];
                                                newReport.receiveBacDatWeights.push(bacDatWeight);
                                                newReport.receiveBacDatWeightsDates.push(bacDatWeightDate);

                                                newReport.receiveWeights.splice(newReport.receiveWeights.length - 1, 1);
                                                newReport.receiveWeightsDates.splice(newReport.receiveWeights.length - 1, 1);
                                            }

                                            if (product.productName.toLowerCase().includes('bạc tồn')) {
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
                                        } catch (e) {
                                            this.toastService.presentToastError(`không tìm thấy sản phẩm có tên ${product.productName}`);
                                            throw e;
                                        }
                                    }
                                    break;
                            }
                        });

                        products = products.sort((a, b) => a.productName >= b.productName ? 1 : -1);

                        products.forEach(product => {
                            // console.log(`${product.productName} - ${productQuantityMapper.get(product.id)}`);
                            newReport.products.push(product);
                            newReport.quantities.push(productQuantityMapper.get(product.id));
                            newReport.totalPricePerProduct.push(product.productPrice * productQuantityMapper.get(product.id));
                        });

                        if (newReport.totalPricePerProduct.length > 0) {
                            newReport.totalPrice = newReport.totalPricePerProduct.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                                return previousValue + currentValue;
                            });
                        } else {
                            newReport.totalPrice = 0;
                        }

                        if (newReport.giveWeights.length > 0) {
                            newReport.totalGiveWeight = Number(newReport.giveWeights.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                                return previousValue + currentValue;
                            })).toFixed(2) as unknown as number;
                        } else {
                            newReport.totalGiveWeight = 0;
                        }

                        if (newReport.receiveWeights.length > 0) {
                            newReport.totalReceiveWeight = Number(newReport.receiveWeights.reduce((previousValue: number, currentValue: number, currentIndex: number, array: number[]) => {
                                return previousValue + currentValue;
                            }).toFixed(2));
                        } else {
                            newReport.totalReceiveWeight = 0;
                        }

                        newReport.totalHaoWeight = Number(Number(newReport.totalReceiveWeight * 0.05).toFixed(2));

                        newReport.totalReceiveWeightAdjusted = Number((newReport.totalReceiveWeight + newReport.totalHaoWeight).toFixed(2));

                        newReport.totalReceiveWeightAdjustedIncludeBacDatVaTon = Number(newReport.totalReceiveWeightAdjusted + newReport.totalReceiveBacDatWeight + newReport.totalReceiveBacTonWeight).toFixed(2) as unknown as number;

                        newReport.totalWeightDifference = Number((newReport.totalGiveWeight - newReport.totalReceiveWeightAdjustedIncludeBacDatVaTon).toFixed(2));
                        newReport.createdAt = new Date();

                        // console.table(productsFromServer);
                        // console.log(newReport);


                        this.order$.subscribe(async orderFromServer => {
                            orderFromServer.orderStatus = Status.DONE;
                            await this.orderService.updateOrder(this.userId, orderFromServer);
                            await this.toastService.presentToastSuccess(`change Status of Order ${orderFromServer.orderName} to DONE successfully`);
                            await this.reportService.createReportByOrderId(this.userId, this.orderId, newReport);
                            await this.toastService.presentToastSuccess(`created Report for Order ${orderFromServer.orderName} successfully`);
                            await this.router.navigate(['users', this.userId, 'reports', this.orderId]);
                            window.dispatchEvent(new Event('resize'));
                            await this.loadingService.dismissLoading();
                        });
                    }
                } catch (e) {
                    console.log(e);
                    await this.toastService.presentToastError(e.message);
                }
            }));
        }));
    }

    configOrderItemsTableSize() {
        this.currentUser$.subscribe(currentUser => {
            if (currentUser) {
                if (currentUser.customClaims.WORKER === true) {
                    const totalTableWidth = this.table._innerWidth;
                    const columnPortions = [1, 1.5, 0.8, 1.7, 0.7, 0.8];
                    const totalPortions = columnPortions.reduce((previousValue, currentValue) => previousValue + currentValue);

                    for (let i = 0; i < this.table._internalColumns.length; i++) {
                        this.table._internalColumns[i].width = (totalTableWidth / totalPortions) * columnPortions[i];
                    }
                }

                if (currentUser.customClaims.ADMIN === true) {
                    const totalTableWidth = this.table._innerWidth;
                    const columnPortions = [1, 1.5, 0.8, 1.7, 0.7, 1, 0.8];
                    const totalPortions = columnPortions.reduce((previousValue, currentValue) => previousValue + currentValue);

                    for (let i = 0; i < this.table._internalColumns.length; i++) {
                        this.table._internalColumns[i].width = (totalTableWidth / totalPortions) * columnPortions[i];
                    }
                }

                if (currentUser.customClaims.DEV === true) {
                    const totalTableWidth = this.table._innerWidth;
                    const columnPortions = [1, 1.5, 0.8, 1.7, 0.7, 0.8, 0.8, 0.7];
                    const totalPortions = columnPortions.reduce((previousValue, currentValue) => previousValue + currentValue);

                    for (let i = 0; i < this.table._internalColumns.length; i++) {
                        this.table._internalColumns[i].width = (totalTableWidth / totalPortions) * columnPortions[i];
                    }
                }
            }
        });

    }
}
