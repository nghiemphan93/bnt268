import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import {Order} from '../../../../../models/order';
import {OrderService} from '../../../../../services/order.service';
import {LoadingService} from '../../../../../services/loading.service';
import {AuthService} from '../../../../../services/auth.service';
import {User} from 'firebase';
import {ToastService} from '../../../../../services/toast.service';
import {IonButton} from '@ionic/angular';
import {UserService} from '../../../../../services/user.service';
import {StatusService} from '../../../../../services/status.service';
import {Status} from '../../../../../models/status.enum';

@Component({
    selector: 'app-order-create',
    templateUrl: './order-create.page.html',
    styleUrls: ['./order-create.page.scss'],
})
export class OrderCreatePage implements OnInit, OnDestroy {
    subscription = new Subscription();
    order: Order;
    validationForm: FormGroup;
    isCreated: boolean;
    isUpdated: boolean;
    isDetailed: boolean;
    minDeadline = new Date(new Date().setDate(new Date().getDate() + 4));
    currentUser$ = this.authService.getCurrentUser$();
    isAuth$ = this.authService.getIsAuth$();
    userId: string;
    user$: Observable<User | any>;
    user: User | any;
    statuses = this.statusService.getStatuses();


    constructor(private orderService: OrderService,
                private formBuilder: FormBuilder,
                private activatedRoute: ActivatedRoute,
                private router: Router,
                private loadingService: LoadingService,
                private authService: AuthService,
                private toastService: ToastService,
                private userService: UserService,
                private statusService: StatusService
    ) {
    }

    async ngOnInit() {
        await this.preparePageContent();
    }

    ngOnDestroy(): void {
        console.log('bye bye OrderCreatePage...');
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Identify what purpose of the page should be.
     * Create or Edit of an Order
     */
    async preparePageContent() {
        this.userId = this.activatedRoute.snapshot.params.userId;
        this.user$ = this.userService.getUser(this.userId);
        const orderId = this.activatedRoute.snapshot.params.orderId;
        const url = this.router.url.split('/');

        switch (url[url.length - 1]) {
            case 'create':
                try {
                    this.user$.subscribe(userFromServer => {
                        this.isCreated = true;
                        this.order = new Order();
                        this.user = userFromServer;
                        this.prepareFormValidationCreate();
                    });
                } catch (e) {
                    console.log(e);
                    await this.toastService.presentToastError(e.message);
                }

                break;
            case 'edit':
                try {
                    this.isUpdated = true;
                    this.subscription.add(this.orderService.getOrder(this.userId, orderId).subscribe(orderFromServer => {
                        this.order = orderFromServer;
                        this.prepareFormValidationUpdate();
                    }));
                } catch (e) {
                    console.log(e);
                    await this.toastService.presentToastError(e);
                }
                break;
        }
    }

    /**
     * Prepare a Reactive Form for Creating an Order
     */
    prepareFormValidationCreate() {
        this.validationForm = this.formBuilder.group({
            orderName: new FormControl('', Validators.required),
            orderComment: new FormControl(''),
            user: new FormControl(this.user, Validators.required)
        });
    }

    /**
     * Prepare a Reactive Form for Updating an Order
     */
    prepareFormValidationUpdate() {
        this.validationForm = this.formBuilder.group({
            orderName: new FormControl(this.order.orderName, Validators.required),
            orderComment: new FormControl(this.order.orderComment),
            user: new FormControl(this.order.user, Validators.required)
        });
    }

    /**
     * Handler Submit button
     */
    async submitHandler(submitButton: IonButton) {
        submitButton.disabled = true;
        await this.loadingService.presentLoading();
        this.order.orderName = this.toTitleCase(this.validationForm.value.orderName);
        this.order.orderComment = this.validationForm.value.orderComment;
        this.order.user = this.validationForm.value.user;

        try {
            if (this.isCreated) {
                this.order.createdAt = new Date();
                this.order.orderStatus = Status.PENDING;
                const documentRef = await this.orderService.createOrder(this.userId, this.order);
                console.log(documentRef);
                await this.toastService.presentToastSuccess(`Created ${this.order.orderName} successfully`);
                this.prepareFormValidationCreate();
            } else {
                const documentRef = await this.orderService.updateOrder(this.userId, this.order);
                console.log(documentRef);
                await this.toastService.presentToastSuccess(`Updated ${this.order.orderName} successfully`);
                this.prepareFormValidationUpdate();
            }
            await this.loadingService.dismissLoading();
            await this.router.navigate([`users/${this.userId}/orders`]);
            window.dispatchEvent(new Event('resize'));
            submitButton.disabled = false;
        } catch (e) {
            console.log(e);
            await this.loadingService.dismissLoading();
            submitButton.disabled = false;
        }
    }

    /**
     * Helper to select data for <ion-select>
     * @param o1: Object
     * @param o2: Object
     */
    compareWithFn(o1, o2) {
        return o1 && o2 ? o1.id === o2.id : o1 === o2;
    }

    /**
     * Helper function to transform a string to title case
     * @param s: any string
     */
    toTitleCase(s: string) {
        if (typeof s !== 'string') {
            return '';
        }
        return s.toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
}
