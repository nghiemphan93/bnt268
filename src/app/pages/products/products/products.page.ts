import {Component, OnChanges, OnDestroy, OnInit, SimpleChanges, ViewChild} from '@angular/core';
import {AngularFireUploadTask} from '@angular/fire/storage';
import {forkJoin, Observable, of, pipe, range, Subscription} from 'rxjs';
import {AngularFirestoreCollection} from '@angular/fire/firestore';
import {AlertController, Config, Platform} from '@ionic/angular';
import {DatatableComponent} from '@swimlane/ngx-datatable';
import {Product} from '../../../models/product';
import {ProductService} from '../../../services/product.service';
import {AlertService} from '../../../services/alert.service';
import {ProductCacheService} from '../../../services/product-cache.service';
import {ToastService} from '../../../services/toast.service';
import {AuthService} from '../../../services/auth.service';
import {PlatformService} from '../../../services/platform.service';

@Component({
    selector: 'app-products',
    templateUrl: './products.page.html',
    styleUrls: ['./products.page.scss'],
})
export class ProductsPage implements OnInit, OnDestroy {
    subscription = new Subscription();
    productsDesktop$: Observable<Product[]>;
    productsMobile$: Observable<Product[]>;
    products: Product[] = [];
    tableStyle = 'material striped';
    skeletons = [1, 2];
    @ViewChild('table', {static: false}) table: DatatableComponent;
    currentUser$ = this.authService.getCurrentUser$();
    isAuth$ = this.authService.getIsAuth$();

    constructor(private productService: ProductService,
                private config: Config,
                private platform: Platform,
                private alertController: AlertController,
                public alertService: AlertService,
                private productCacheService: ProductCacheService,
                private toastService: ToastService,
                private authService: AuthService,
                public platformService: PlatformService
    ) {
    }

    ngOnInit() {
        this.presentToastErrorIfTableNoData();
    }

    ionViewDidEnter() {
        if (this.platformService.isMobile) {
            this.productsMobile$ = this.productCacheService.getProductsCache$();
        } else {
            this.productsDesktop$ = this.productCacheService.getProductsCache$();
        }
    }

    ngOnDestroy() {
        console.log('bye bye ProductsPage...');
        if (this.productService.isPageFullyLoaded()) {
            this.productService.setPageFullyLoaded(false);
        }
        if (this.subscription) {
            this.subscription.unsubscribe();
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

    /**
     * Triggered when content being scrolled 100px above the page's bottom to load for more Products
     * @param event: CustomerEvent
     */
    loadData(event: any) {
        if (this.productService.isPageFullyLoaded()) {
            event.target.disabled = true;
        } else {
            if (this.platformService.isMobile) {
                // TODO
                event.target.complete();
            } else {
                // this.productsDesktop$.push(this.productService.getLimitedProductsAfterLastDoc());
                // this.subscription.add(this.productsDesktop$[this.productsDesktop$.length - 1].subscribe(moreProducts => {
                //     this.addPaginatedProducts(moreProducts);
                //     event.target.complete();
                // }));

                // this.productsDesktop$.push(this.productService.getLimitedProductsAfterLastDoc());
                // event.target.complete();

                // this.productsDesktop$.push(this.productService.getLimitedProductsAfterLastDoc());
                // this.productsDesktop$.forEach(products$ => {
                //     this.subscription.add(products$.subscribe(moreProducts => {
                //         console.log(moreProducts);
                //         event.target.complete();
                //     }));
                // });
            }
        }
    }

    /**
     * Add new or updated Products to this.products based on the first product's index
     * @param moreProducts: Product[]
     */
    private addPaginatedProducts(moreProducts: Product[]) {
        if (moreProducts.length > 0) {
            const productIndex = this.products.findIndex(product => product.id === moreProducts[0].id);
            if (productIndex >= 0) {
                console.log('edited product from block: ' + productIndex);
                const products = [...this.products];
                products.splice(productIndex, moreProducts.length, ...moreProducts);
                this.products = products;
            } else {
                console.log('loaded more products');
                let products = [...this.products];
                products = [...products, ...moreProducts];
                this.products = [...products];
            }
        }
    }

    doNothing($event: MouseEvent) {

    }
}
