import {Injectable} from '@angular/core';
import {User} from 'firebase';
import {BehaviorSubject, Observable} from 'rxjs';
import {UserService} from './user.service';
import {AuthService} from './auth.service';
import {ToastService} from './toast.service';

@Injectable({
    providedIn: 'root'
})
export class UserCacheService {
    usersCache: (User | any)[];
    usersSubject = new BehaviorSubject<User | any>(null);

    constructor(private userService: UserService,
                private authService: AuthService,
                private toastService: ToastService
    ) {
        console.log('user cache service created...');
    }

    getUsersCache$(): Observable<(User | any)[]> {
        if (this.usersCache) {
            console.log('users cache available...');
            return this.usersSubject.asObservable();
        } else {
            console.log('make HTTP call to get users...');
            try {
                this.userService.getUsers()
                    .subscribe(usersFromServer => {
                        this.usersCache = usersFromServer;
                        this.usersSubject.next(this.usersCache);
                    });
            } catch (e) {
                console.log(e);
            }
        }
    }
}
