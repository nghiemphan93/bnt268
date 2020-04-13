import {Injectable} from '@angular/core';
import {ToastController} from '@ionic/angular';
import {DatatableComponent} from '@swimlane/ngx-datatable';

@Injectable({
    providedIn: 'root'
})
export class ToastService {

    constructor(private toastController: ToastController) {
    }

    async presentToastSuccess(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 4000,
            color: 'success'
        });
        await toast.present();
    }

    async presentToastError(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 4000,
            color: 'danger'
        });
        await toast.present();
    }

    presentToastErrorIfTableNoData(table: DatatableComponent) {
        setTimeout(async () => {
            if (table.rowCount === 0) {
                table.rowCount = -1;
                const toast = await this.toastController.create({
                    message: 'No data or Network error. Please add more data or refresh the page',
                    duration: 4000,
                    color: 'danger'
                });
                await toast.present();
            }
        }, 4000);
    }
}
