import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {RouteReuseStrategy} from '@angular/router';

import {IonicModule, IonicRouteStrategy} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AngularFireAuthGuardModule} from '@angular/fire/auth-guard';
import {DatePipe} from '@angular/common';

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireFunctionsModule,
        AngularFireAuthGuardModule
    ],
    providers: [
        StatusBar,
        SplashScreen,
        DatePipe
        // {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        // {
        //     provide: LOCALE_ID,
        //     useValue: 'de-DE' // 'de-DE' for Germany, 'fr-FR' for France ...
        // }
    ],
    exports: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
