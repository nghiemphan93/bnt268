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
    reportId: string;
    report$: Observable<Report>;
    productsReportData = [];
    silverReportData = [];
    report: Report;
    tableStyle = 'material';
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
                public platformService: PlatformService
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
    }

    prepareTableData() {
        this.report$.subscribe(reportFromServer => {
            this.report = reportFromServer;
            console.log(this.report);
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
            row.giveWeight = this.report.giveWeights[i];
            row.receiveWeight = this.report.receiveWeights[i] + ' chỉ';
            if (this.report.giveWeights[i] === undefined || this.report.giveWeights[i] === null) {
                row.giveWeight = 0;
            }
            if (this.report.receiveWeights[i] === undefined || this.report.receiveWeights[i] === null) {
                row.receiveWeight = 0;
            }
            silverReportData.push(row);
        }

        const totalGiveReceiveRow: any = {};
        totalGiveReceiveRow.firstColumn = 'Tổng Giao và Nhận';
        totalGiveReceiveRow.giveWeight = this.report.totalGiveWeight;
        totalGiveReceiveRow.receiveWeight = this.report.totalReceiveWeight + ' chỉ';
        silverReportData.push(totalGiveReceiveRow);

        const receiveWeightAdjustedRow: any = {};
        receiveWeightAdjustedRow.firstColumn = 'Nhận Cộng Hao';
        receiveWeightAdjustedRow.giveWeight = 0;
        // receiveWeightAdjustedRow.receiveWeight = this.report.totalReceiveWeightAdjusted;
        receiveWeightAdjustedRow.receiveWeight = `${this.report.totalReceiveWeight} chỉ x 1.05 = ${this.report.totalReceiveWeightAdjusted} chỉ`;
        silverReportData.push(receiveWeightAdjustedRow);

        const bacDatRow: any = {};
        bacDatRow.firstColumn = 'Bạc Dát';
        bacDatRow.giveWeight = 0;
        bacDatRow.receiveWeight = this.report.totalReceiveBacDatWeight + ' chỉ';
        silverReportData.push(bacDatRow);

        const bacTonRow: any = {};
        bacTonRow.firstColumn = 'Bạc Tồn';
        bacTonRow.giveWeight = 0;
        bacTonRow.receiveWeight = this.report.totalReceiveBacTonWeight + ' chỉ';
        silverReportData.push(bacTonRow);

        const receiveWeightAdjustedIncludeBacDatRow: any = {};
        receiveWeightAdjustedIncludeBacDatRow.firstColumn = 'Tổng đã cộng hao, tồn và dát';
        receiveWeightAdjustedIncludeBacDatRow.giveWeight = this.report.totalGiveWeight;
        // receiveWeightAdjustedIncludeBacDatRow.receiveWeight = this.report.totalReceiveWeightAdjustedIncludeBacDat;
        receiveWeightAdjustedIncludeBacDatRow.receiveWeight = `${this.report.totalReceiveWeightAdjusted} + ${this.report.totalReceiveBacDatWeight} + ${this.report.totalReceiveBacTonWeight} = ${this.report.totalReceiveWeightAdjustedIncludeBacDatVaTon} chỉ`;
        silverReportData.push(receiveWeightAdjustedIncludeBacDatRow);

        const giveReceiveDifferenceRow: any = {};
        giveReceiveDifferenceRow.firstColumn = 'Giao - Nhận';
        giveReceiveDifferenceRow.giveWeight = 0;
        giveReceiveDifferenceRow.receiveWeight = `${this.report.totalGiveWeight} - ${this.report.totalReceiveWeightAdjustedIncludeBacDatVaTon} = ${this.report.totalWeightDifference} chỉ`;
        silverReportData.push(giveReceiveDifferenceRow);

        const lastRow: any = {};
        lastRow.firstColumn = '';
        lastRow.giveWeight = 0;
        lastRow.receiveWeight = `Tổng ${this.report.totalWeightDifference} chỉ`;
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
