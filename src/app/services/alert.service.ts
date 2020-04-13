import {Injectable} from '@angular/core';
import {AlertController} from '@ionic/angular';
import {Order} from '../models/order';
import {Product} from '../models/product';
import {ToastService} from './toast.service';
import {User} from 'firebase';
import {AuthService} from './auth.service';
import {OrderService} from './order.service';
import {ProductService} from './product.service';

@Injectable({
    providedIn: 'root'
})
export class AlertService {

    constructor(private alertController: AlertController,
                private toastService: ToastService,
                private authService: AuthService,
                private orderService: OrderService,
                private productService: ProductService
    ) {
    }

    async presentDeleteConfirm(toDeleteObject: Order | Product | User) {
        const alert = await this.alertController.create({
            header: 'Confirm!',
            message: '<strong>Are you sure to delete?</strong>!!!',
            buttons: [
                {
                    text: 'Cancel',
                    role: 'cancel',
                    cssClass: 'secondary',
                    handler: (blah) => {
                        console.log('canceled');
                    }
                }, {
                    text: 'Okay',
                    handler: () => {
                        console.log('okay');
                        this.deleteObjectHelper(toDeleteObject);
                    }
                }
            ]
        });
        await alert.present();
    }

    private async deleteObjectHelper(toDeleteObject: Order | Product | User) {
        try {
            if (toDeleteObject.hasOwnProperty('orderName')) {
                const toDeleteOrder = toDeleteObject as Order;
                await this.orderService.deleteOrder(toDeleteOrder.user.uid, toDeleteOrder);
                await this.toastService.presentToastSuccess(`Successfully deleted Order ${toDeleteOrder.orderName}`);
            }
            if (toDeleteObject.hasOwnProperty('productName')) {
                const toDeleteProduct = toDeleteObject as Product;
                await this.productService.deleteProduct(toDeleteProduct);
                await this.toastService.presentToastSuccess(`Successfully deleted Product ${toDeleteProduct.productName}`);
            }
            if ('email' in toDeleteObject) {
                const toDeleteUser = toDeleteObject as User;
                await this.authService.deleteUserByAdmin(toDeleteUser.email);
                console.log(`deleted ${toDeleteUser.email}`);
                await this.toastService.presentToastSuccess(`Successfully deleted User ${toDeleteUser.email}`);
            }
        } catch (e) {
            console.log(e);
            await this.toastService.presentToastError(e.message);
        }
    }
}
