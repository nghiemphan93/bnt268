import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {UsersPageRoutingModule} from './users-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        UsersPageRoutingModule
    ],
    declarations: []
})
export class UsersPageModule {
}
