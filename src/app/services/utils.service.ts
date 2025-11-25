import { Injectable, inject } from '@angular/core';
import { AlertController, AlertOptions, LoadingController, ModalController, ModalOptions, ToastController, ToastOptions } from '@ionic/angular';
import { Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);
  modalCtrl = inject(ModalController)
  alerCtrl = inject(AlertController)

  //===== Camara =====


// Reemplazar el método takePicture existente por este:
async takePicture(promptLabelHeader: string) {
  const photo = await Camera.getPhoto({
    quality: 60, // ⭐ Reducir calidad de 90 a 60 (reduce tamaño)
    allowEditing: false, // ⭐ Cambiar a false para NO guardar en galería
    resultType: CameraResultType.DataUrl,
    source: CameraSource.Prompt, 
    promptLabelHeader,
    promptLabelCancel: 'Cancelar',
    promptLabelPhoto: 'Usar foto',
    promptLabelPicture: 'Tomar foto',
  });

  // ⭐ AGREGAR: Validar y comprimir si excede 1MB
  return this.compressImageIfNeeded(photo.dataUrl);
}

// ⭐ AGREGAR NUEVO MÉTODO: Comprimir imagen si excede 1MB
private async compressImageIfNeeded(base64Image: string): Promise<{ dataUrl: string }> {
  const sizeInBytes = (base64Image.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  // Si es menor a 1MB, retornar tal cual
  if (sizeInMB <= 1) {
    return { dataUrl: base64Image };
  }

  // Si excede 1MB, comprimir
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Image;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Calcular nuevas dimensiones (reducir al 70%)
      let width = img.width;
      let height = img.height;
      const maxSize = 1200; // Ancho/alto máximo
      
      if (width > height && width > maxSize) {
        height = (height * maxSize) / width;
        width = maxSize;
      } else if (height > maxSize) {
        width = (width * maxSize) / height;
        height = maxSize;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Comprimir iterativamente hasta que sea menor a 1MB
      let quality = 0.7;
      let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      while ((compressedDataUrl.length * 3) / 4 / (1024 * 1024) > 1 && quality > 0.1) {
        quality -= 0.1;
        compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      }
      
      resolve({ dataUrl: compressedDataUrl });
    };
  });
}

async presentAlert(opts?: AlertOptions) {
  const alert = await this.alerCtrl.create(opts);

  await alert.present();
}

  //===== Loading =====
  loading() {
    return this.loadingCtrl.create({ spinner: 'bubbles' })

  }

  //===== Toast =====
 async presentToast(opts?: {
  message: string;
  duration?: number;
  position?: 'top' | 'middle' | 'bottom';
  color?: string;
  icon?: string;
}) {
  const toast = await this.toastCtrl.create({
    message: opts.message,
    duration: opts.duration || 2500,
    position: opts.position || 'bottom',
    color: opts.color,
    icon: opts.icon,
    cssClass: 'custom-toast',  // Clase personalizada
  });
  toast.present();
}

  //===== Enruta a cualquier pagina disponible =====

  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

  //===== Guardar en localstorage =====

  saveInLocalStorage(key: string, value: any) {
    return localStorage.setItem(key, JSON.stringify(value));
  }

  //===== Obtener de localstorage =====

  // getFromLocalStorage(key: string) {
  //   console.log(typeof localStorage.getItem(key) );
   
  //   if (localStorage.getItem(key)== 'undefined') {
  //     return null;
  //   }
  //    return JSON.parse(localStorage.getItem(key));  
  // }

  getFromLocalStorage(key: string) { return JSON.parse(localStorage.getItem(key)); }

    //===== Convertir File a base64 (para imagen/audio/video) =====
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);

      reader.readAsDataURL(file);
    });
  }
  
  //===== MODAL =====
  async presentModal(opts: ModalOptions) {
    const modal = await this.modalCtrl.create(opts);
    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data) return data;
    }

    dismissModal(data?: any) {
      return this.modalCtrl.dismiss(data);
    }

}
    

