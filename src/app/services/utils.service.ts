import { Injectable, inject } from '@angular/core';
import { LoadingController, ToastController, ToastOptions } from '@ionic/angular';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  loadingCtrl = inject(LoadingController);
  toastCtrl = inject(ToastController);
  router = inject(Router);

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

  getFromLocalStorage(key: string) {
    return JSON.parse(localStorage.getItem(key));
  }
}
    