// import { Component, inject, OnInit } from '@angular/core';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
// import { User } from 'src/app/models/user.model';
// import { FirebaseService } from 'src/app/services/firebase.service';
// import { UtilsService } from 'src/app/services/utils.service';

// @Component({
//   selector: 'app-forgot-password',
//   templateUrl: './forgot-password.page.html',
//   styleUrls: ['./forgot-password.page.scss'],
//   standalone: false
// })
// export class ForgotPasswordPage implements OnInit {

//   form = new FormGroup({
//     email: new FormControl('', [Validators.required, Validators.email]),

//   });

//   firebaseSvc = inject(FirebaseService);

//   utilsSvc = inject(UtilsService);

//   ngOnInit() { }

//   async submit() {
//     const loading = await this.utilsSvc.loading();
//     await loading.present();


//     this.firebaseSvc.sendRecoveryEmail(this.form.value.email).then(() => {
//       console.log('Correo de restablecimiento enviado');
//       this.utilsSvc.presentToast({
//         message: 'Correo de restablecimiento de contraseña enviado. Revisa tu bandeja de entrada.',
//         duration: 3000,
//         color: 'success',
//         icon: 'mail-open-outline', 
//       });

//     })
//       .catch((err) => {
//         console.error('Error al loguear', err);
//         this.utilsSvc.presentToast({
//           message: 'Error al iniciar sesión: ' + err.message,
//           duration: 2500,
//           color: 'danger',

//           icon: 'alert-circle',
//         });
//       })
//       .finally(() => {
//         loading.dismiss();
//       });
//   }


// }


//====== NUEVO FORMATO CONN SIGNALS ======

import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false
})
export class ForgotPasswordPage implements OnInit {

  // Signal para controlar si ya se envió el correo
  emailSent = signal(false);
  // Signal para loading interno (sin el modal)
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(6)]),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  ngOnInit() {
    this.form.controls.password.disable();
  }

  async submit() {
    (document.activeElement as HTMLElement)?.blur();

    // Si aún no se ha enviado el correo
    if (!this.emailSent()) {
      if (this.form.controls.email.invalid) {
        this.form.controls.email.markAsTouched();
        return;
      }

      // Activar parpadeo del botón
      this.isLoading.set(true);

      // Mostrar toast INMEDIATAMENTE
      this.utilsSvc.presentToast({
        message: 'Correo enviado. Ingresa tu nueva contraseña.',
        duration: 4000,
        color: 'warning',
        icon: 'checkmark-circle-outline',
      });

      // Enviar el correo en segundo plano
      this.firebaseSvc.sendRecoveryEmail(this.form.value.email)
        .then(() => {
          console.log('Correo de restablecimiento enviado');
        })
        .catch((err) => {
          console.error('Error al enviar correo', err);
        });

      // Después de 6 segundos: mostrar campo de contraseña y quitar parpadeo
      setTimeout(() => {
        this.emailSent.set(true);
        this.form.controls.password.enable();
        this.isLoading.set(false);
      }, 4000);
    }
    else {
      if (this.form.invalid) {
        this.form.markAllAsTouched();
        return;
      }

      this.isLoading.set(true); // opcional: para reusar el pulso

      this.firebaseSvc.signIn(this.form.value as User)
        .then((cred) => {
          this.isLoading.set(false);

          // 🔹 Muy importante: guardar usuario mínimo en localStorage
          const firebaseUser = cred.user;
          localStorage.setItem(
            'user',
            JSON.stringify({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            })
          );

          this.utilsSvc.presentToast({
            message: '¡Bienvenido de nuevo!',
            duration: 6000,
            color: 'success',
            icon: 'checkmark-circle',
          });

          // 🔹 Ahora sí: esto disparará el AuthGuard,
          // que ya no se colgará y que verá un user válido.
          this.utilsSvc.routerLink('/main/home');
        })
        .catch((err) => {
          this.isLoading.set(false);
          console.error('Error al iniciar sesión', err);
          this.utilsSvc.presentToast({
            message: err.message || 'Error al iniciar sesión',
            duration: 2500,
            color: 'danger',
            icon: 'alert-circle',
          });
        });
    }

  }
}