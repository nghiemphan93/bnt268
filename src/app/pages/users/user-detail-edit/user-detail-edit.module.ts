import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserDetailEditPageRoutingModule } from './user-detail-edit-routing.module';

import { UserDetailEditPage } from './user-detail-edit.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserDetailEditPageRoutingModule
  ],
  declarations: [UserDetailEditPage]
})
export class UserDetailEditPageModule {}
