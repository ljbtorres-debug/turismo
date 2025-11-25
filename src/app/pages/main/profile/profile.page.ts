import { Component, inject, OnInit } from '@angular/core';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false
})
export class ProfilePage implements OnInit {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  profileImageBase64: string | null = null;

  ngOnInit() {
    this.loadUserData();
  }

  user(): User | null {
    return this.utilsSvc.getFromLocalStorage('user') as User | null;
  }

  async loadUserData() {
    const user = this.user();
    if (!user) return;

    // Obtiene el documento del usuario en Firestore
    const data = await this.firebaseSvc.getDocument(`users/${user.uid}`);
    this.profileImageBase64 = data?.['profileImageBase64'] || null;
  }

  async updateProfileImage() {
    const user = this.user();
    if (!user) return;

    // Tomar foto (tu método actual)
    const photo = await this.utilsSvc.takePicture('Imagen de Perfil');
    const base64 = photo.dataUrl;

    this.profileImageBase64 = base64; // previsualización inmediata

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      // Guardamos la imagen en el documento del usuario
      await this.firebaseSvc.setDocument(`users/${user.uid}`, {
        profileImageBase64: base64
      });

      this.utilsSvc.presentToast({
        message: 'Foto de perfil actualizada correctamente',
        color: 'success',
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: error.message || 'Error al actualizar la foto',
        color: 'danger',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }
}
