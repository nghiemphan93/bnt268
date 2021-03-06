import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {AngularFireStorage, AngularFireUploadTask} from '@angular/fire/storage';
import {Observable, Subscription} from 'rxjs';
import {AngularFirestore, AngularFirestoreCollection} from '@angular/fire/firestore';
import {finalize, tap} from 'rxjs/operators';
import {FormArray, FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {tryCatch} from 'rxjs/internal-compatibility';
import {ActivatedRoute, Router} from '@angular/router';

import {IonButton} from '@ionic/angular';
import {Product} from '../../../models/product';
import {ProductService} from '../../../services/product.service';
import {ToastService} from '../../../services/toast.service';
import {LoadingService} from '../../../services/loading.service';


@Component({
    selector: 'app-product-create',
    templateUrl: './product-create.page.html',
    styleUrls: ['./product-create.page.scss'],
})
export class ProductCreatePage implements OnInit, OnDestroy {
    subscription = new Subscription();
    product: Product;
    validationForm: FormGroup;
    oldImageUrl: string;
    isCreated: boolean;
    isUpdated: boolean;
    isDetailed: boolean;

    constructor(private productService: ProductService,
                private formBuilder: FormBuilder,
                private router: Router,
                private activatedRoute: ActivatedRoute,
                private toastService: ToastService,
                private loadingService: LoadingService
    ) {
    }

    ngOnInit() {
        this.preparePageContent();
    }

    @HostListener('unloaded')
    ngOnDestroy() {
        console.log('bye bye ProductCreatePage...');
        if (this.subscription) {
            this.subscription.unsubscribe();
        }

        window.dispatchEvent(new Event('resize'));
    }

    /**
     * Identify what purpose of the page should be.
     * Create, Edit or Detail of a Customer
     */
    preparePageContent() {
        const productId = this.activatedRoute.snapshot.params.productId;
        const url = this.router.url.split('/');


        switch (url[url.length - 1]) {
            case 'create':
                this.isCreated = true;
                this.product = new Product();
                this.prepareFormValidationCreate();
                break;
            case 'edit':
                try {
                    this.isUpdated = true;
                    this.subscription.add(this.productService.getProduct(productId).subscribe(productFromServer => {
                        this.product = productFromServer;
                        this.prepareFormValidationUpdateOrDetail();
                    }));
                } catch (e) {
                    console.log(e);
                }
                break;
            default :
                try {
                    this.isDetailed = true;
                    this.subscription.add(this.productService.getProduct(productId).subscribe(productFromServer => {
                        this.product = productFromServer;
                        this.prepareFormValidationUpdateOrDetail();
                    }));
                } catch (e) {
                    console.log(e);
                }
                break;
        }
    }

    /**
     * Prepare a Reactive Form for Creating a Product
     */
    prepareFormValidationCreate() {
        this.validationForm = this.formBuilder.group({
            productName: new FormControl('', Validators.required),
            productPrice: new FormControl('', Validators.required),
        });
    }

    /**
     * Prepare a Reactive Form for Editing or Showing Details of a Product
     */
    prepareFormValidationUpdateOrDetail() {
        this.validationForm = this.formBuilder.group({
            productName: new FormControl(this.product.productName, Validators.required),
            productPrice: new FormControl(this.product.productPrice, Validators.required),
        });
    }

    /**
     * Handler Submit button
     */
    async submitHandler(submitButton: IonButton) {
        submitButton.disabled = true;
        await this.loadingService.presentLoading();

        this.product.productName = this.toTitleCase(this.validationForm.value.productName);
        this.product.productPrice = this.validationForm.value.productPrice;

        try {
            if (this.isCreated) {
                this.product.createdAt = new Date();
                await this.productService.createProduct(this.product);
                await this.toastService.presentToastSuccess(`Created ${this.product.productName} successfully`);
                // this.prepareFormValidationCreate();

            } else {
                await this.productService.updateProduct(this.product);
                await this.toastService.presentToastSuccess(`Updated ${this.product.productName} successfully`);
                // this.prepareFormValidationUpdateOrDetail();
            }

            await this.router.navigate(['products']);
            window.dispatchEvent(new Event('resize'));
            await this.loadingService.dismissLoading();
            submitButton.disabled = false;
        } catch (e) {
            console.log(e);
            await this.toastService.presentToastError(e.message);
            await this.loadingService.dismissLoading();
            submitButton.disabled = false;
        }
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
