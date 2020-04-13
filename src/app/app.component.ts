import {Component, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';
import {AuthService} from './services/auth.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
    public selectedIndex = 0;
    isAuth$ = this.authService.getIsAuth$();
    user$ = this.authService.getCurrentUser$();

    appPages = [
        {
            title: 'Các sản phẩm',
            url: '/products'
        },
        {
            title: 'Danh sách Thợ',
            url: '/users',
        },
        {
            title: 'Profile',
            url: '/users/userId'  // TODO
        },
        {
            title: 'Sign In',
            url: '/signin'
        },
        {
            title: 'Sign Out',
            url: '/signout'
        }
    ];

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        private authService: AuthService,
        private router: Router
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
        });
    }

    ngOnInit() {
        // const pathComponents: string[] = window.location.pathname.split('/');
        // if (path !== undefined) {
        //   this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
        // }
    }

    setSelected(selectedIndex: number) {
        this.selectedIndex = selectedIndex;
    }

    async signOutHandler() {
        this.selectedIndex = 3;

        try {
            await this.authService.signOut();
            await this.router.navigate(['signin']);
        } catch (e) {
            console.log(e);
        }
    }
}
