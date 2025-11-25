import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { NativeBiometric, BiometryType } from "@capgo/capacitor-native-biometric";


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

      // ⭐ GUARDAR password antes de borrarlo
      const email = this.form.value.email;
      const password = this.form.value.password;

      delete this.form.value.password;

      this.firebaseSvc.getDocument(path).then(async (user: User) => {
        this.utilsSvc.saveInLocalStorage('user', user);

        this.utilsSvc.presentToast({
          message: ` Hola de nuevo ${user.name}`,
          duration: 1800,
          color: 'success',
          icon: 'person-circle-outline',
        });

        // ⭐ MOVER NAVEGACIÓN ANTES DEL BIOMÉTRICO
        this.utilsSvc.routerLink('/main/home');
        this.form.reset();

        // ⭐ Preguntar después de navegar (no bloquea la carga)
        await this.askToSaveBiometricCredentials(email, password);
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
  }

  async performBiometricVerification() {
    const result = await NativeBiometric.isAvailable(); //esta línea nos indica si el autentificación está disponible

    if (!result.isAvailable) return;//Y si no está disponible entonces no se ejecutara la función



    //ahora bien se corrobora que está disponible procede a aplicar la verificación de datos, se la verificaciones es correcta devuelve True y si no False
    const verified = await NativeBiometric.verifyIdentity({

    })
      .then(() => true)
      .catch(() => false);

    if (verified) {
      alert('Usuario verificado exitosamente');
      this.utilsSvc.routerLink('/main/home');
    } else {
      alert('No se pudo verificar al usuario');
    }
  }

  // ===== MÉTODOS BIOMÉTRICOS =====

  // Preguntar si quiere guardar credenciales después del login exitoso
 async askToSaveBiometricCredentials(email: string, password: string) {
  try {
    // ⭐ AGREGAR try-catch aquí
    const hasCredentials = await this.getStoredCredentials();
    if (hasCredentials) return;
    
    const result = await NativeBiometric.isAvailable();
    if (!result.isAvailable) return;

    const alert = await this.utilsSvc.alerCtrl.create({
      header: 'Acceso Biométrico',
      message: '¿Deseas usar tu huella digital para iniciar sesión más rápido?',
      buttons: [
        {
          text: 'No, gracias',
          role: 'cancel'
        },
        {
          text: 'Sí, activar',
          handler: async () => {
            await this.saveBiometricCredentials(email, password);
          }
        }
      ]
    });

    await alert.present();
  } catch (error) {
    // ⭐ Si falla (en web), simplemente no hacer nada
    console.log('Biométrico no disponible en este dispositivo');
  }
}

  async saveBiometricCredentials(email: string, password: string) {
    try {
      await NativeBiometric.setCredentials({
        username: email,
        password: password,
        server: "product-admin-jtk"
      });

      console.log('Credenciales guardadas correctamente');

      this.utilsSvc.presentToast({
        message: 'Acceso biométrico activado',
        duration: 2000,
        color: 'success',
        icon: 'finger-print-outline',
      });
    } catch (error) {
      console.error('Error al guardar credenciales:', error);
    }
  }

  /**
   * LOGIN CON BIOMÉTRICO
   * Permite al usuario iniciar sesión usando solo su huella o Face ID
   * 
   * Flujo:
   * 1. Solicita verificación biométrica (huella/Face ID)
   * 2. Si es exitosa, recupera las credenciales guardadas
   * 3. Llena automáticamente el formulario
   * 4. Ejecuta el submit para hacer login en Firebase
   */
  async loginWithBiometric() {
    try {
      // 1. Solicitar verificación biométrica al usuario
      // Muestra el diálogo nativo del sistema (sensor de huella o Face ID)
      await NativeBiometric.verifyIdentity({
        reason: "Iniciar sesión",           // Mensaje mostrado al usuario
        title: "Autenticación",             // Título del diálogo
      });

      // 2. Si la verificación fue exitosa, recuperar credenciales guardadas
      // Las credenciales solo se desencriptan después de verificación exitosa
      const credentials = await NativeBiometric.getCredentials({
        server: "product-admin-jtk"         // Mismo identificador usado al guardar
      });

      // 3. Si se recuperaron las credenciales, llenar el formulario
      if (credentials) {
        this.form.patchValue({
          email: credentials.username,      // Email guardado
          password: credentials.password    // Password guardado
        });

        // 4. Ejecutar submit automáticamente para hacer login
        await this.submit();
      }
    } catch (error) {
      // Si el usuario cancela o falla la verificación, mostrar error
      console.error('Error biométrico:', error);
      this.utilsSvc.presentToast({
        message: 'No se pudo verificar la identidad',
        duration: 2000,
        color: 'danger',
        icon: 'alert-circle-outline',
      });
    }
  }

  /**
   * OBTENER CREDENCIALES ALMACENADAS
   * Verifica si existen credenciales guardadas en el dispositivo
   * sin necesidad de verificación biométrica
   * 
   * Usado para:
   * - Mostrar/ocultar el botón de login biométrico
   * - Verificar si ya hay credenciales antes de preguntar si quiere guardarlas
   */
async getStoredCredentials() {
  try {
    const credentials = await NativeBiometric.getCredentials({
      server: "product-admin-jtk"
    });
    return credentials;
  } catch (error) {
    // ⭐ Si falla, retornar null (no hay credenciales o no está en móvil)
    return null;
  }
}

  /**
   * ELIMINAR CREDENCIALES BIOMÉTRICAS
   * Borra las credenciales guardadas del dispositivo
   * 
   * Usado para:
   * - Desactivar el acceso biométrico
   * - Cerrar sesión completamente
   * - Cambiar de cuenta
   */
  async deleteBiometricCredentials() {
    try {
      // Eliminar credenciales del almacenamiento seguro del dispositivo
      await NativeBiometric.deleteCredentials({
        server: "product-admin-jtk"
      });

      console.log('Credenciales eliminadas correctamente');

      this.utilsSvc.presentToast({
        message: 'Acceso biométrico desactivado',
        duration: 2000,
        color: 'medium',
        icon: 'finger-print-outline',
      });
    } catch (error) {
      console.error('Error al eliminar:', error);
    }
  }
}


