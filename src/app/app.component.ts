import {Component, OnInit} from '@angular/core';

import {Platform} from '@ionic/angular';
import {SplashScreen} from '@ionic-native/splash-screen/ngx';
import {StatusBar} from '@ionic-native/status-bar/ngx';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit {
    public selectedIndex = 0;
    // public appPages = [
    //   {
    //     title: 'Inbox',
    //     url: '/folder/Inbox',
    //     icon: 'mail'
    //   },
    //   {
    //     title: 'Outbox',
    //     url: '/folder/Outbox',
    //     icon: 'paper-plane'
    //   },
    //   {
    //     title: 'Favorites',
    //     url: '/folder/Favorites',
    //     icon: 'heart'
    //   },
    //   {
    //     title: 'Archived',
    //     url: '/folder/Archived',
    //     icon: 'archive'
    //   },
    //   {
    //     title: 'Trash',
    //     url: '/folder/Trash',
    //     icon: 'trash'
    //   },
    //   {
    //     title: 'Spam',
    //     url: '/folder/Spam',
    //     icon: 'warning'
    //   }
    // ];
    appPages = [
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
            click: this.signOutHandler()
        }
    ];

    signOutHandler() {
        console.log('signing out...');
    }

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar
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
        const pathComponents: string[] = window.location.pathname.split('/');
        console.log(pathComponents);
        // if (path !== undefined) {
        //   this.selectedIndex = this.appPages.findIndex(page => page.title.toLowerCase() === path.toLowerCase());
        // }
    }

    setSelected(selectedIndex: number) {
        this.selectedIndex = selectedIndex;
    }
}
