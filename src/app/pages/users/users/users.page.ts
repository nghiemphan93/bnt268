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

@Component({
    selector: 'app-users',
    templateUrl: './users.page.html',
    styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit, OnDestroy {
    subscription = new Subscription();
    users$: Observable<User[] | any[]>;
    tableStyle = 'material';
    isDesktop: boolean;
    isMobile: boolean;
    skeletons = [1, 2];
    currentUser$: Observable<User | any>;
    @ViewChild('table', {static: false}) table: DatatableComponent;

    constructor(private authService: AuthService,
                private platform: Platform,
                private alertController: AlertController,
                private userService: UserService,
                public claimService: ClaimService,
                public alertService: AlertService,
                private toastService: ToastService
    ) {
    }

    ngOnInit() {
        this.preparePlatform();
        this.presentToastErrorIfTableNoData();
    }

    ionViewDidEnter() {
        this.currentUser$ = this.authService.getCurrentUser$();
        this.users$ = this.userService.getUsers();
    }

    ngOnDestroy() {
        console.log('bye bye UserSPage...');
    }

    presentToastErrorIfTableNoData() {
        setTimeout(async () => {
            if (this.table.rowCount === 0) {
                this.table.rowCount = -1;
                await this.toastService.presentToastError('No data or Network error. Please add more data or refresh the page');
            }
        }, 4000);
    }

    /**
     * Identify which platform is being used
     */
    private preparePlatform() {
        this.isDesktop = this.platform.is('desktop');
        this.isMobile = !this.platform.is('desktop');
    }
}
