import {Injectable} from '@angular/core';
import {
    AngularFirestore,
    AngularFirestoreCollection,
    AngularFirestoreDocument,
    DocumentReference,
    QueryDocumentSnapshot
} from '@angular/fire/firestore';
import {Observable} from 'rxjs';
import {AuthService} from './auth.service';
import {filter, map, takeUntil} from 'rxjs/operators';
import {User} from 'firebase';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    constructor(private afs: AngularFirestore,
                private authService: AuthService) {
        console.log('user service created...');
    }

    /**
     * Return all Users from Database
     */
    getUsers(): Observable<User[] | any[]> {
        const users = this.afs
            .collection('users', ref => ref.orderBy('email', 'asc'))
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(actions => {
                    console.log('-----------------------------------');
                    actions.forEach(act => {
                        const user = act.payload.doc.data() as User | any;
                        console.log(user.email + ' from cache=' + act.payload.doc.metadata.fromCache + ' type=' + act.payload.type
                        );
                    });
                    console.log('-----------------------------------');

                    return actions.map(act => {
                        const data = act.payload.doc.data() as User | any;
                        data.uid = act.payload.doc.id;
                        return data;
                    });
                })
            );
        return users;
    }

    /**
     * Return one User from Database given customerId
     * @param userId: string
     */
    getUser(userId: string): Observable<User | any> {
        const user = this.afs.doc<User | any>(`users/${userId}`)
            .snapshotChanges().pipe(
                takeUntil(this.authService.getIsAuth$().pipe(filter(isAuth => isAuth === false))),
                map(action => {
                    if (action.payload.exists === false) {
                        return null;
                    } else {
                        const data = action.payload.data() as User | any;
                        data.uid = action.payload.id;
                        return data;
                    }
                })
            );
        return user;
    }

    /**
     * Upload one new User to Database
     * @param newUser: Customer
     */
    createUser(newUser: User | any): Promise<DocumentReference> {
        return this.afs
            .collection('users')
            .add({...newUser});
    }

    /**
     * Update one User to Database
     * @param toUpdateUser: Customer
     */
    updateCustomer(toUpdateUser: User | any) {
        return this.afs.doc(`users/${toUpdateUser.uid}`)
            .update(toUpdateUser);
    }

    /**
     * Delete one User from Database
     * @param toDeleteUser: User
     */
    deleteUser(toDeleteUser: User | any) {
        return this.afs.doc(`users/${toDeleteUser.uid}`)
            .delete();
    }
}
