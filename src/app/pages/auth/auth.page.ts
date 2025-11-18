import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  standalone: false,
})
export class AuthPage implements OnInit {
  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
  });

  firebaseSvc = inject(FirebaseService);

  utilsSvc = inject(UtilsService);

  ngOnInit() { }

  async submit() {
    const loading = await this.utilsSvc.loading();
    await loading.present();


    this.firebaseSvc.signIn(this.form.value as User).then((res) => {
      console.log('Usuario logueado', res);
      this.getUserInfo(res.user.uid);

    })
      .catch((err) => {
        console.error('Error al loguear', err);
        this.utilsSvc.presentToast({
          message: 'Error al iniciar sesión: ' + err.message,
          duration: 2500,
          color: 'danger',

          icon: 'alert-circle',
        });
      })
      .finally(() => {
        loading.dismiss();
      });
  }

  async getUserInfo(uid: string) {
    if (this.form.valid) {
      const loading = await this.utilsSvc.loading();
      await loading.present();

      let path = `users/${uid}`;
      delete this.form.value.password;



      this.firebaseSvc.getDocument(path).then((user: User) => {
        this.utilsSvc.saveInLocalStorage('user', user);
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        this.utilsSvc.presentToast({
          message: ` Hola de nuevo ${user.name}`,
          duration: 1800,
          color: 'success',
          icon: 'person-circle-outline',
        });

      })

        .catch((err) => {
          console.error('Error al loguear', err);

          this.utilsSvc.presentToast({
            message: 'Error al iniciar sesión: ' + err.message,
            duration: 2500,
            color: 'danger',

            icon: 'alert-circle',
          });
        }
        )
        .finally(() => {
          loading.dismiss();
        });
    }
  }
}
