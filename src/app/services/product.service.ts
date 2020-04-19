import {Injectable} from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument, DocumentChangeAction,
    DocumentReference, DocumentSnapshot, QueryDocumentSnapshot,
} from '@angular/fire/firestore';
import {Product} from '../models/product';
import {Observable, of} from 'rxjs';
import {filter, map, take, takeUntil} from 'rxjs/operators';
import {AuthService} from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ProductService {
    pageLimit = 10;
    lastDocSnapshot: QueryDocumentSnapshot<unknown>;
    pageFullyLoaded = false;

    constructor(private afs: AngularFirestore,
                private authService: AuthService
    ) {
        console.log('product service created...');
    }

    /**
     * Return all Products from Database
     */
    getProducts(): Observable<Product[]> {
        // Get Products with the ids
        const products = this.afs
            .collection('products', ref => ref.orderBy('productName', 'asc'))
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(actions => {
                    console.log('-----------------------------------');
                    actions.forEach(act => {
                        const product = act.payload.doc.data() as Product;
                        console.log(product.productName + ' from cache=' + act.payload.doc.metadata.fromCache + ' type=' + act.payload.type);
                    });
                    console.log('-----------------------------------');

                    return actions.map(act => {
                        const data = act.payload.doc.data() as Product;
                        data.id = act.payload.doc.id;
                        return data;
                    });
                })
            );

        return products;
    }

    /**
     * Return one Product from Database given productId
     * @param productId: string
     */
    getProduct(productId: string): Observable<Product> {
        const product = this.afs
            .doc<Product>(`products/${productId}`)
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(action => {
                    if (action.payload.exists === false) {
                        return null;
                    } else {
                        const data = action.payload.data() as Product;
                        data.id = action.payload.id;
                        return data;
                    }
                })
            );
        return product;
    }

    /**
     * Upload one new Product to Database
     * @param newProduct: Product
     */
    async createProduct(newProduct: Product): Promise<DocumentReference> {
        return this.afs
            .collection('products')
            .add({...newProduct});
    }

    /**
     * Update one Product to Database
     * @param updatedProduct: Product
     */
    async updateProduct(updatedProduct: Product) {
        return this.afs.doc(`products/${updatedProduct.id}`)
            .update(updatedProduct);
    }

    /**
     * Delete one Product from Database
     * @param toDeleteProduct: Product
     */
    async deleteProduct(toDeleteProduct: Product) {
        return this.afs.doc(`products/${toDeleteProduct.id}`)
            .delete();
    }

    /**
     * Return the first limited Products from the top of the ordered result
     * Used for Pagination
     */
    getLimitedProductsAfterStart(): Observable<Product[]> {
        const products = this.afs.collection('products', ref =>
            ref
                .orderBy('productName', 'asc')
                .limit(this.pageLimit)).snapshotChanges().pipe(
            takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
            map(actions => {
                    try {
                        if (this.isPageFullyLoaded() === false) {
                            this.saveLastDocSnapshot(actions);
                        }
                        return actions.map(act => {
                            const data = act.payload.doc.data() as Product;
                            data.id = act.payload.doc.id;

                            return data;
                        });
                    } catch (e) {
                        console.log(e);
                    }
                }
            )
        );
        return products;
    }

    /**
     * Return the next limited Products from the last Query's Document Snapshot
     * Used for Pagination
     */
    getLimitedProductsAfterLastDoc(): Observable<Product[]> {
        const products = this.afs.collection('products', ref =>
            ref
                .orderBy('productName', 'asc')
                .limit(this.pageLimit)
                .startAfter(this.lastDocSnapshot))
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(actions => {
                        try {
                            if (actions.length === 0) {
                                this.setPageFullyLoaded(true);
                            }
                            if (this.isPageFullyLoaded() === false) {
                                this.saveLastDocSnapshot(actions);
                            }
                            return actions.map(act => {
                                const data = act.payload.doc.data() as Product;
                                data.id = act.payload.doc.id;
                                return data;
                            });
                        } catch (e) {
                            return [];
                        }
                    }
                )
            );
        return products;
    }

    /**
     * Helper to save the last Document Snapshot
     * @param actions: DocumentChangeAction<any>[]
     */
    private saveLastDocSnapshot(actions: DocumentChangeAction<unknown>[]): void {
        let isAdded = true;
        console.log('-----------------------------------');
        actions.forEach(act => {
            // @ts-ignore
            console.log(act.payload.doc.data().productName + ' from cache=' + act.payload.doc.metadata.fromCache + ' type=' + act.type);
            if (act.type !== 'added') {
                isAdded = false;
                return;
            }
        });
        console.log(isAdded);
        console.log('-----------------------------------');
        if (isAdded) {
            this.lastDocSnapshot = actions[actions.length - 1].payload.doc; // Remember last Document Snapshot
        }
    }

    /**
     * Return if all data were fully loaded
     */
    isPageFullyLoaded() {
        return this.pageFullyLoaded;
    }

    /**
     * Set page's state if data fully loaded
     * @param isPageFullyLoaded: boolean
     */
    setPageFullyLoaded(isPageFullyLoaded: boolean) {
        this.pageFullyLoaded = isPageFullyLoaded;
    }
}
