import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {OrderService} from '../../../../../services/order.service';
import {OrderItemService} from '../../../../../services/order-item.service';
import {ProductService} from '../../../../../services/product.service';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../../../../services/toast.service';
import {LoadingService} from '../../../../../services/loading.service';
import {AuthService} from '../../../../../services/auth.service';
import {UserService} from '../../../../../services/user.service';
import {KindService} from '../../../../../services/kind.service';
import {ReportService} from '../../../../../services/report.service';
import {Observable, Subscription} from 'rxjs';
import {OrderItem} from '../../../../../models/orderitem';
import {Order} from '../../../../../models/order';
import {Product} from '../../../../../models/product';
import {User} from 'firebase';
import {Report} from '../../../../../models/report';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {takeLast} from 'rxjs/operators';
import {ReportCacheService} from '../../../../../services/report-cache.service';
import {Platform} from '@ionic/angular';
import {PlatformService} from '../../../../../services/platform.service';
import {DatePipe, formatDate} from '@angular/common';
import Timestamp = firebase.firestore.Timestamp;
import * as firebase from 'firebase';
import DateTimeFormat = Intl.DateTimeFormat;

@Component({
    selector: 'app-report-create',
    templateUrl: './report-create.page.html',
    styleUrls: ['./report-create.page.scss'],
})
export class ReportCreatePage implements OnInit, OnDestroy {
    subscription = new Subscription();
    orderItemProducts: FormArray;
    orderItemQuantities: FormArray;
    currentUser$ = this.authService.getCurrentUser$();
    isAuth$ = this.authService.getIsAuth$();
    userId: string;
    user$: Observable<User | any>;
    orderId: string;
    order$: Observable<Order>;
    reportId: string;
    report$: Observable<Report>;
    productsReportData = [];
    silverReportData = [];
    report: Report;
    tableStyle = 'material striped';
    @ViewChild('productsTable', {static: false}) productsTable: DatatableComponent;
    @ViewChild('silverTable', {static: false}) silverTable: DatatableComponent;
    skeletons = [1, 2];

    constructor(private orderService: OrderService,
                private orderItemService: OrderItemService,
                private productService: ProductService,
                private formBuilder: FormBuilder,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private toastService: ToastService,
                private loadingService: LoadingService,
                private authService: AuthService,
                private userService: UserService,
                private kindService: KindService,
                private reportService: ReportService,
                private reportCacheService: ReportCacheService,
                private platform: Platform,
                public platformService: PlatformService,
                private datePipe: DatePipe
    ) {
    }

    ngOnInit() {
        this.prepareAttributes();
        this.presentToastErrorIfTableNoData();
        this.prepareTableData();
    }

    presentToastErrorIfTableNoData() {
        setTimeout(async () => {
            if ((this.platformService.isDesktop || this.platformService.isTablet) && this.productsTable.rowCount === 0) {
                this.productsTable.rowCount = -1;
                await this.toastService.presentToastError('No data or Network error. Please add more data or refresh the page');
            }

            if ((this.platformService.isDesktop || this.platformService.isTablet) && this.silverTable.rowCount === 0) {
                this.silverTable.rowCount = -1;
                await this.toastService.presentToastError('No data or Network error. Please add more data or refresh the page');
            }
        }, 4000);
    }

    ngOnDestroy(): void {
        console.log('bye bye ReportPage...');
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        window.dispatchEvent(new Event('resize'));
    }

    prepareAttributes() {
        this.userId = this.activatedRoute.snapshot.params.userId;
        this.user$ = this.userService.getUser(this.userId);
        this.reportId = this.activatedRoute.snapshot.params.reportId;
        this.report$ = this.reportService.getReport(this.userId, this.reportId);
        this.orderId = this.activatedRoute.snapshot.params.reportId;
        this.order$ = this.orderService.getOrder(this.userId, this.reportId);
    }

    prepareTableData() {
        this.report$.subscribe(reportFromServer => {
            this.report = reportFromServer;
            // console.log(this.report);
            this.prepareProductsData();
            this.prepareSilverData();
            console.table(this.productsReportData);
            console.table(this.silverReportData);
        });
    }

    prepareProductsData() {
        const productsReportData = [];
        let totalPrice = 0;
        for (let i = 0; i < this.report.products.length; i++) {
            const row: any = {};
            row.productName = this.report.products[i].productName;
            row.quantity = this.report.quantities[i];
            row.price = this.report.products[i].productPrice;
            row.totalPrice = row.quantity * row.price;
            totalPrice += row.totalPrice;
            productsReportData.push(row);
        }

        const lastRow: any = {};
        lastRow.totalPrice = totalPrice;
        productsReportData.push(lastRow);
        this.productsReportData = [...productsReportData];

        // Emit event to resize columns width
        if (this.platformService.isTablet || this.platformService.isDesktop) {
            this.configProductsReportTableSize();
            this.productsTable.headerComponent.select.emit();
        }
    }

    configProductsReportTableSize() {
        const totalTableWidth = this.productsTable._innerWidth;
        const columnPortions = [1.5, 1, 1, 3];
        const totalPortions = columnPortions.reduce((previousValue, currentValue) => previousValue + currentValue);
        for (let i = 0; i < this.silverTable._internalColumns.length; i++) {
            this.productsTable._internalColumns[i].width = (totalTableWidth / totalPortions) * columnPortions[i];
        }
    }

    prepareSilverData() {
        const silverReportData = [];
        let rowNumber = 0;
        if (this.report.giveWeights.length >= this.report.receiveWeights.length) {
            rowNumber = this.report.giveWeights.length;
        } else {
            rowNumber = this.report.receiveWeights.length;
        }

        for (let i = 0; i < rowNumber; i++) {
            const row: any = {};
            row.firstColumn = '';
            if (this.report.giveWeights[i] === undefined || this.report.giveWeights[i] === null) {
                row.giveWeight = 0;
            } else {
                row.giveWeight = `${this.report.giveWeights[i]} chỉ (${this.datePipe.transform(new Date((this.report.giveWeightsDates[i] as unknown as Timestamp).seconds * 1000), 'dd/MM')})`;
            }
            if (this.report.receiveWeights[i] === undefined || this.report.receiveWeights[i] === null) {
                row.receiveWeight = 0;
            } else {
                row.receiveWeight = `${this.report.receiveWeights[i]} chỉ (${this.datePipe.transform(new Date((this.report.receiveWeightsDates[i] as unknown as Timestamp).seconds * 1000), 'dd/MM')})`;
            }
            silverReportData.push(row);
        }

        const totalGiveReceiveRow: any = {};
        totalGiveReceiveRow.firstColumn = 'Tổng Giao và Nhận';
        totalGiveReceiveRow.giveWeight = Number(this.report.totalGiveWeight).toFixed(2);
        totalGiveReceiveRow.receiveWeight = this.report.totalReceiveWeight + '';
        silverReportData.push(totalGiveReceiveRow);

        const haoRow: any = {};
        haoRow.firstColumn = 'Hao';
        haoRow.giveWeight = 0;
        // haoRow.receiveWeight = `${this.report.totalReceiveWeight} x 0.05 = ${Number(this.report.totalReceiveWeight * 0.05).toFixed(2)}`;
        haoRow.receiveWeight = `${this.report.totalReceiveWeight} x 0.05 = ${this.report.totalHaoWeight}`;
        silverReportData.push(haoRow);

        const receiveWeightAdjustedRow: any = {};
        receiveWeightAdjustedRow.firstColumn = 'Nhận cộng Hao';
        receiveWeightAdjustedRow.giveWeight = 0;
        // receiveWeightAdjustedRow.receiveWeight = `${this.report.totalReceiveWeight} x 1.05 = ${this.report.totalReceiveWeightAdjusted}`;
        receiveWeightAdjustedRow.receiveWeight = `${this.report.totalReceiveWeight} + ${this.report.totalHaoWeight} = ${this.report.totalReceiveWeightAdjusted}`;
        silverReportData.push(receiveWeightAdjustedRow);

        const bacDatRow: any = {};
        bacDatRow.firstColumn = 'Bạc Dát';
        bacDatRow.giveWeight = 0;
        let bacDatString = '';
        if (this.report.totalReceiveBacDatWeight !== 0) {
            for (let i = 0; i < this.report.receiveBacDatWeights.length; i++) {
                if (bacDatString !== '') {
                    bacDatString = `${bacDatString} + ${this.report.receiveBacDatWeights[i]} (${this.datePipe.transform(new Date((this.report.receiveBacDatWeightsDates[i] as unknown as Timestamp).seconds * 1000), 'dd/MM')})`;
                } else {
                    bacDatString = `${this.report.receiveBacDatWeights[i]} (${this.datePipe.transform(new Date((this.report.receiveBacDatWeightsDates[i] as unknown as Timestamp).seconds * 1000), 'dd/MM')})`;
                }
            }
            bacDatString += ' = ' + this.report.totalReceiveBacDatWeight;
        } else {
            bacDatString = '0 chỉ';
        }
        bacDatRow.receiveWeight = bacDatString;
        silverReportData.push(bacDatRow);

        const bacTonRow: any = {};
        bacTonRow.firstColumn = 'Bạc Tồn';
        bacTonRow.giveWeight = 0;
        // bacTonRow.receiveWeight = this.report.totalReceiveBacTonWeight + '';
        let bacTonString = '';
        if (this.report.totalReceiveBacTonWeight !== 0) {
            for (let i = 0; i < this.report.receiveBacTonWeights.length; i++) {
                if (bacTonString !== '') {
                    bacTonString = `${bacTonString} + ${this.report.receiveBacTonWeights[i]} (${this.datePipe.transform(new Date((this.report.receiveBacTonWeightsDates[i] as unknown as Timestamp).seconds * 1000), 'dd/MM')})`;
                } else {
                    bacTonString = `${this.report.receiveBacTonWeights[i]} (${this.datePipe.transform(new Date((this.report.receiveBacTonWeightsDates[i] as unknown as Timestamp).seconds * 1000), 'dd/MM')})`;
                }
            }
            bacTonString += ' = ' + this.report.totalReceiveBacTonWeight;
        } else {
            bacTonString = '0 chỉ';
        }
        bacTonRow.receiveWeight = bacTonString;
        silverReportData.push(bacTonRow);

        const receiveWeightAdjustedIncludeBacDatRow: any = {};
        receiveWeightAdjustedIncludeBacDatRow.firstColumn = 'Tổng đã cộng hao, tồn và dát';
        receiveWeightAdjustedIncludeBacDatRow.giveWeight = Number(this.report.totalGiveWeight).toFixed(2);
        // receiveWeightAdjustedIncludeBacDatRow.receiveWeight = this.report.totalReceiveWeightAdjustedIncludeBacDat;
        receiveWeightAdjustedIncludeBacDatRow.receiveWeight = `${this.report.totalReceiveWeightAdjusted} + ${this.report.totalReceiveBacDatWeight} + ${this.report.totalReceiveBacTonWeight} = ${this.report.totalReceiveWeightAdjustedIncludeBacDatVaTon}`;
        silverReportData.push(receiveWeightAdjustedIncludeBacDatRow);

        const giveReceiveDifferenceRow: any = {};
        giveReceiveDifferenceRow.firstColumn = 'Giao trừ Nhận';
        giveReceiveDifferenceRow.giveWeight = 0;
        giveReceiveDifferenceRow.receiveWeight = `${this.report.totalGiveWeight} - ${this.report.totalReceiveWeightAdjustedIncludeBacDatVaTon} = ${this.report.totalWeightDifference}`;
        silverReportData.push(giveReceiveDifferenceRow);

        const lastRow: any = {};
        lastRow.firstColumn = '';
        lastRow.giveWeight = 0;
        lastRow.receiveWeight = `Tất cả: ${this.report.totalWeightDifference}`;
        silverReportData.push(lastRow);

        this.silverReportData = [...silverReportData];


        // Emit event to resize columns width
        if (this.platformService.isTablet || this.platformService.isDesktop) {
            this.configSilverReportTableSize();
            this.silverTable.headerComponent.select.emit();
        }
    }

    configSilverReportTableSize() {
        const totalTableWidth = this.silverTable._innerWidth;
        const columnPortions = [2, 1, 2];
        const totalPortions = columnPortions.reduce((previousValue, currentValue) => previousValue + currentValue);
        for (let i = 0; i < this.silverTable._internalColumns.length; i++) {
            this.silverTable._internalColumns[i].width = (totalTableWidth / totalPortions) * columnPortions[i];
        }
    }
}
