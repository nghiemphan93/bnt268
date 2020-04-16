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
    tableData = [];
    report: Report;
    tableStyle = 'material';
    @ViewChild('table', {static: false}) table: DatatableComponent;

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
    ) {
    }

    ngOnInit() {
        this.prepareAttributes();
        this.presentToastErrorIfTableNoData();
        this.prepareTableData();
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
        this.report$.subscribe(report => {
            this.report = report;
            const tableData = [];
            let totalPrice = 0;
            for (let i = 0; i < this.report.products.length; i++) {
                const row: any = {};
                console.log(this.report.products[i]);
                row.productName = this.report.products[i].productName;
                row.quantity = this.report.quantities[i];
                row.price = this.report.products[i].productPrice;
                row.totalPrice = row.quantity * row.price;
                totalPrice += row.totalPrice;
                tableData.push(row);
            }

            const lastRow: any = {};
            lastRow.totalPrice = totalPrice;
            tableData.push(lastRow);
            this.tableData = [...tableData];
        });
    }

}
