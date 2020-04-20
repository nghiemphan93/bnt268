import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from 'rxjs';
import {OrderItem} from '../../../../../models/orderitem';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {User} from 'firebase';
import {Order} from '../../../../../models/order';
import {OrderService} from '../../../../../services/order.service';
import {AlertController, Config, Platform} from '@ionic/angular';
import {ActivatedRoute} from '@angular/router';
import {AlertService} from '../../../../../services/alert.service';
import {ToastService} from '../../../../../services/toast.service';
import {AuthService} from '../../../../../services/auth.service';
import {UserService} from '../../../../../services/user.service';
import {OrderItemService} from '../../../../../services/order-item.service';
import {OrderItemCacheService} from '../../../../../services/order-item-cache.service';
import {StatusService} from '../../../../../services/status.service';

@Component({
    selector: 'app-reports',
    templateUrl: './reports.page.html',
    styleUrls: ['./reports.page.scss'],
})
export class ReportsPage implements OnInit {
    constructor() {
    }

    ngOnInit() {
    }
}
