import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AlertController, Config, Platform} from '@ionic/angular';
import {Observable, Subscription} from 'rxjs';
import {User} from 'firebase';
import {AuthService} from '../../../services/auth.service';
import {UserService} from '../../../services/user.service';
import {AlertService} from '../../../services/alert.service';
import {ClaimService} from '../../../services/claim.service';
import {log} from 'util';
import {Claim} from '../../../models/claim.enum';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {ToastService} from '../../../services/toast.service';
import {UserCacheService} from '../../../services/user-cache.service';
import {PlatformService} from '../../../services/platform.service';

@Component({
    selector: 'app-users',
    templateUrl: './users.page.html',
    styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit, OnDestroy {
    subscription = new Subscription();
    users$: Observable<User[] | any[]>;
    tableStyle = 'material';
    skeletons = [1, 2];
    currentUser$: Observable<User | any>;
    @ViewChild('table', {static: false}) table: DatatableComponent;
    isAuth$ = this.authService.getIsAuth$();

    constructor(private authService: AuthService,
                private platform: Platform,
                private alertController: AlertController,
                private userService: UserService,
                public claimService: ClaimService,
                public alertService: AlertService,
                private toastService: ToastService,
                private userCacheService: UserCacheService,
                public platformService: PlatformService
    ) {
    }

    ngOnInit() {
        this.presentToastErrorIfTableNoData();
        this.currentUser$ = this.authService.getCurrentUser$();
    }

    ionViewDidEnter() {
        this.users$ = this.userCacheService.getUsersCache$();
    }

    ngOnDestroy() {
        console.log('bye bye UserSPage...');
        window.dispatchEvent(new Event('resize'));
    }

    presentToastErrorIfTableNoData() {
        setTimeout(async () => {
            if ((this.platformService.isDesktop || this.platformService.isTablet) && this.table.rowCount === 0) {
                this.table.rowCount = -1;
                await this.toastService.presentToastError('No data or Network error. Please add more data or refresh the page');
            }
        }, 4000);
    }
}
