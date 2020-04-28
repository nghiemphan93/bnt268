import {AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {OrderService} from '../../../../../../../services/order.service';
import {OrderItemService} from '../../../../../../../services/order-item.service';
import {ProductService} from '../../../../../../../services/product.service';
import {AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '../../../../../../../services/toast.service';
import {LoadingService} from '../../../../../../../services/loading.service';
import {Observable, Subscription} from 'rxjs';
import {OrderItem} from '../../../../../../../models/orderitem';
import {Order} from '../../../../../../../models/order';
import {Product} from '../../../../../../../models/product';
import {AuthService} from '../../../../../../../services/auth.service';
import {User} from 'firebase';
import {UserService} from '../../../../../../../services/user.service';
import {IonButton, IonSelect} from '@ionic/angular';
import {Kind} from '../../../../../../../models/kind.enum';
import {KindService} from '../../../../../../../services/kind.service';
import {element} from 'protractor';
import {log} from 'util';

@Component({
    selector: 'app-order-item-create',
    templateUrl: './order-item-create.page.html',
    styleUrls: ['./order-item-create.page.scss'],
})
export class OrderItemCreatePage implements OnInit, OnDestroy, AfterViewInit {
    subscription = new Subscription();
    orderItem: OrderItem;
    validationForm: FormGroup;
    orderId: string;
    order$: Observable<Order>;
    order: Order;
    products$: Observable<Product[]>;
    isCreated = false;
    isUpdated = false;
    isDetailed = false;
    orderItemProducts: FormArray;
    orderItemQuantities: FormArray;
    currentUser$ = this.authService.getCurrentUser$();
    isAuth$ = this.authService.getIsAuth$();
    userId: string;
    user$: Observable<User | any>;
    orderItemId: string;
    kinds = this.kindService.getKinds();
    GIAO = Kind.GIAO;
    NHẬN = Kind.NHẬN;
    @ViewChildren('productSelectElements') productsIonSelectQuery: QueryList<IonSelect>;
    productsIonSelects: IonSelect[];

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
                private kindService: KindService
    ) {
    }

    async ngOnInit() {
        this.prepareAttributes();
        await this.preparePageContent();
    }

    ionViewDidEnter() {
    }

    @HostListener('unloaded')
    ngOnDestroy(): void {
        console.log('bye bye OrderItemCreatePage...');
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Prepare all Observables for the page
     */
    prepareAttributes() {
        this.userId = this.activatedRoute.snapshot.params.userId;
        this.user$ = this.userService.getUser(this.userId);
        this.orderId = this.activatedRoute.snapshot.params.orderId;
        this.order$ = this.orderService.getOrder(this.userId, this.orderId);
        this.products$ = this.productService.getProducts();
        this.orderItemId = this.activatedRoute.snapshot.params.orderItemId;
    }

    /**
     * Identify what purpose of the page should be.
     * Create, Edit or Showing Detail of an Order Item
     */
    async preparePageContent() {
        const url = this.router.url.split('/');

        switch (url[url.length - 1]) {
            case 'create':
                this.isCreated = true;
                try {
                    this.order$.subscribe(orderFromServer => {
                        this.order = orderFromServer;
                        this.orderItem = new OrderItem();
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
                    this.subscription.add(this.orderItemService.getOrderItem(this.userId, this.orderId, this.orderItemId).subscribe(orderItemFromServer => {
                        this.orderItem = orderItemFromServer;
                        this.prepareFormValidationUpdateOrDetail();
                    }));
                } catch (e) {
                    console.log(e);
                }
                break;
            default :
                try {
                    this.isDetailed = true;
                    this.subscription.add(this.orderItemService.getOrderItem(this.userId, this.orderId, this.orderItemId).subscribe(orderItemFromServer => {
                        this.orderItem = orderItemFromServer;
                        this.prepareFormValidationUpdateOrDetail();
                    }));
                } catch (e) {
                    console.log(e);
                }
                break;
        }
    }

    /**
     * Prepare a Reactive Form for Creating an Order Item
     */
    prepareFormValidationCreate() {
        this.validationForm = this.formBuilder.group({
            orderItemName: new FormControl(''),
            orderItemComment: new FormControl(''),
            orderItemKind: new FormControl('', Validators.required),
            orderItemProducts: new FormArray([]),
            orderItemQuantities: new FormArray([]),
            orderItemWeight: new FormControl('', Validators.required),
            order: new FormControl(this.order, Validators.required),
        });

        this.orderItemProducts = this.validationForm.get('orderItemProducts') as FormArray;
        this.orderItemQuantities = this.validationForm.get('orderItemQuantities') as FormArray;
        this.addProductAndQuantityFormControl();
    }

    addProductAndQuantityFormControl(product?: Product, quantity?: number) {
        this.orderItemProducts.push(new FormControl(product, Validators.required));
        this.orderItemQuantities.push(new FormControl(quantity, [Validators.required, Validators.pattern('^[0-9]*$')]));
    }

    removeProductAndQuantityFormControl(index: number) {
        if (this.orderItemProducts.length > 1) {
            this.orderItemProducts.removeAt(index);
            this.orderItemQuantities.removeAt(index);
        }
    }

    /**
     * Prepare a Reactive Form for Updating or Showing Detail of an Order Item
     */
    prepareFormValidationUpdateOrDetail() {
        this.validationForm = this.formBuilder.group({
            orderItemName: new FormControl(this.orderItem.orderItemName),
            orderItemComment: new FormControl(this.orderItem.orderItemComment),
            orderItemKind: new FormControl(this.orderItem.orderItemKind, Validators.required),
            orderItemProducts: new FormArray([]),
            orderItemQuantities: new FormArray([]),
            orderItemWeight: new FormControl(this.orderItem.orderItemWeight, Validators.required),
            order: new FormControl(this.orderItem.order, Validators.required),
        });

        this.orderItemProducts = this.validationForm.get('orderItemProducts') as FormArray;
        this.orderItemQuantities = this.validationForm.get('orderItemQuantities') as FormArray;


        const products: Product[] = this.orderItem.orderItemProducts;
        const quantities: number[] = this.orderItem.orderItemQuantities;
        if (products.length === 0) {
            this.addProductAndQuantityFormControl();
        } else {
            for (let i = 0; i < products.length; i++) {
                this.addProductAndQuantityFormControl(products[i], quantities[i]);
            }
        }
    }

    ngAfterViewInit(): void {
        this.productsIonSelectQuery.changes.subscribe(el => {
            const ionSelects: IonSelect[] = el._results;
            this.productsIonSelects = ionSelects;
            console.log(ionSelects);
            ionSelects.forEach(async ionSelect => {
                // if (ionSelect.value) {
                //     ionSelect.selectedText = ionSelect.value.productName;
                // }
                console.log(ionSelect);
                // await ionSelect.open();
                // await ionSelect.ionCancel;
            });
        });
    }


    /**
     * Transfer data from Reactive From to Order Item Object
     */
    async transferDataFromFormToObject() {
        this.orderItem.orderItemName = this.validationForm.value.orderItemName;
        this.orderItem.orderItemComment = this.validationForm.value.orderItemComment;
        this.orderItem.orderItemKind = this.validationForm.value.orderItemKind;
        this.orderItem.orderItemWeight = this.validationForm.value.orderItemWeight;
        this.orderItem.order = this.validationForm.value.order;


        const orderItemProducts: Product[] = this.validationForm.value.orderItemProducts;
        const orderItemQuantities: number[] = this.validationForm.value.orderItemQuantities;
        for (let i = 0; i < orderItemProducts.length; i++) {
            if (i < this.orderItem.orderItemProducts.length) {
                this.orderItem.orderItemProducts[i] = orderItemProducts[i];
                this.orderItem.orderItemQuantities[i] = orderItemQuantities[i];
            } else {
                this.orderItem.orderItemProducts.push(orderItemProducts[i]);
                this.orderItem.orderItemQuantities.push(orderItemQuantities[i]);
            }
        }
        for (let i = 0; i < this.orderItem.orderItemProducts.length; i++) {
            if (this.orderItem.orderItemQuantities[i] === null || this.orderItem.orderItemQuantities[i] === undefined) {
                this.orderItem.orderItemProducts.splice(i, 1);
                this.orderItem.orderItemQuantities.splice(i, 1);
            }
        }
    }

    /**
     * Handler Submit button
     */
    async submitHandler(submitButton: IonButton) {
        // console.log(this.validationForm.value);
        // await this.transferDataFromFormToObject();
        // console.log(this.orderItem);

        submitButton.disabled = true;
        await this.loadingService.presentLoading();
        await this.transferDataFromFormToObject();
        try {
            if (this.isCreated) {
                this.orderItem.createdAt = new Date();
                const result = await this.orderItemService.createOrderItem(this.userId, this.orderId, this.orderItem);
                this.orderItem.id = result.id;
                await this.toastService.presentToastSuccess(`Successfully created Order Item ${this.orderItem.orderItemName}`);
                this.prepareFormValidationCreate();
            } else {
                await this.orderItemService.updateOrderItem(this.userId, this.orderId, this.orderItem);
                await this.toastService.presentToastSuccess(`Successfully updated Order Item ${this.orderItem.orderItemName}`);
                this.prepareFormValidationUpdateOrDetail();
            }

            await this.loadingService.dismissLoading();
            await this.router.navigate(['users', this.userId, 'orders', this.orderId, 'orderItems']);
            window.dispatchEvent(new Event('resize'));
            submitButton.disabled = false;
        } catch (e) {
            console.log(e);
            await this.loadingService.dismissLoading();
            await this.toastService.presentToastError(e.message);
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

    bacDatHandler(productIndex: number) {
        console.log(this.productsIonSelects[productIndex]);
        const selectedProduct: Product = this.validationForm.value.orderItemProducts[productIndex];
        const selectedQuantity: number = this.validationForm.value.orderItemQuantities[productIndex];
        if (selectedProduct.productName.toLowerCase() === 'bạc dát' || selectedProduct.productName.toLowerCase() === 'bạc tồn') {
            this.orderItemQuantities.at(productIndex).patchValue(0);
        } else {
            this.orderItemQuantities.at(productIndex).patchValue(null);
        }
    }

    isBacDatOrBacTon(productIndex: number) {
        const selectedProduct: Product = this.validationForm.value.orderItemProducts[productIndex];
        const selectedQuantity: number = this.validationForm.value.orderItemQuantities[productIndex];
        if (selectedProduct) {
            if (selectedProduct.productName.toLowerCase() === 'bạc dát' || selectedProduct.productName.toLowerCase() === 'bạc tồn') {
                return true;
            } else {
                return false;
            }
        }
    }
}
