import {Injectable} from '@angular/core';
import {Platform} from '@ionic/angular';

@Injectable({
    providedIn: 'root'
})
export class PlatformService {
    isDesktop: boolean;
    isMobile: boolean;
    isTablet: boolean;

    constructor(private platform: Platform) {
        console.log('platform service created...');
        this.preparePlatforms();
    }

    private preparePlatforms() {
        this.isDesktop = this.platform.is('desktop');
        this.isMobile = this.platform.is('mobile');
        this.isTablet = this.platform.is('tablet');
    }
}
