import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {AngularFirestore} from '@angular/fire/firestore';
import {ToastService} from '../../services/toast.service';
import {IonButton} from '@ionic/angular';
import {LoadingService} from '../../services/loading.service';
import {User} from 'firebase';

@Component({
    selector: 'app-signin',
    templateUrl: './signin.page.html',
    styleUrls: ['./signin.page.scss'],
})
export class SigninPage implements OnInit {
    validationForm: FormGroup;
    error: string;
    isAuth$ = this.authService.getIsAuth$();
    user$ = this.authService.getCurrentUser$();

    constructor(private formBuilder: FormBuilder,
                private authService: AuthService,
                private router: Router,
                private toastService: ToastService,
                private loadingService: LoadingService
    ) {
    }

    ngOnInit() {
        this.prepareFormValidation();
    }

    /**
     * Prepare a Reactive Form for Signing In an User
     */
    prepareFormValidation() {
        this.validationForm = this.formBuilder.group({
            email: new FormControl('dev@bnt268.com', Validators.compose([
                Validators.pattern(/^[a-zA-Z]{1,}[0-9]?([\.\_-]? [a-zA-Z0-9]+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/),
                Validators.required])),
            password: new FormControl('phanphan', Validators.required)
        });
    }

    /**
     * Handler Sign In button
     */
    async signInHandler(submitButton: IonButton) {
        submitButton.disabled = true;
        await this.loadingService.presentLoading();
        const email = this.validationForm.value.email;
        const password = this.validationForm.value.password;

        try {
            const userCredential = await this.authService.signIn(email, password);
            this.validationForm.reset();
            this.authService.getCurrentUser$().subscribe(async currentUser => {
                if (currentUser) {
                    if (currentUser.customClaims.WORKER === true) {
                        await this.router.navigate(['users', currentUser.uid, 'orders']);
                    } else {
                        console.log(currentUser);
                        await this.router.navigate(['users']);
                    }
                    await this.toastService.presentToastSuccess('Sign in successfully');
                    await this.loadingService.dismissLoading();
                    submitButton.disabled = false;
                }
            });
            // await this.router.navigate(['products']);
            // await this.toastService.presentToastSuccess('Sign in successfully');
            // await this.loadingService.dismissLoading();
            // submitButton.disabled = false;
        } catch (e) {
            console.log(e);
            this.error = e.message;
            await this.loadingService.dismissLoading();
            await this.toastService.presentToastError(e.message);
            submitButton.disabled = false;
        }
    }
}
