import {Injectable} from '@angular/core';
import {Kind} from '../models/kind.enum';

@Injectable({
    providedIn: 'root'
})
export class KindService {
    kinds: (string | Kind)[] = Object.entries(Kind).map(e => e[1]);

    constructor() {
        console.log('kind service created...');
    }

    getKinds() {
        return this.kinds;
    }


}
