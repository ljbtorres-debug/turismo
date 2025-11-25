import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
  standalone: false
})
export class MainPage implements OnInit {
  
  pages = [
    {title: 'Inicio', url: '/main/home', icon: 'home-outline'},
    {title: 'Perfil', url: '/main/profile', icon: 'person-outline'},
  ]

  router = inject(Router);
  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  menuCtrl = inject(MenuController);
  currentPath: string = '';
  
  // ⭐ CAMBIO PRINCIPAL: Guardar usuario en una propiedad
  currentUser: User | null = null;

  ngOnInit() {
    // ⭐ Leer localStorage UNA SOLA VEZ al iniciar
    this.currentUser = this.utilsSvc.getFromLocalStorage('user') as User | null;
    
    this.router.events.subscribe((event: any) => {
      if (event?.url) {
        this.currentPath = event.url;
      }
    });
  }
  

  private isLoggingOut = false;

  // ===== Cerrar sesión =====
 async signOut(event?: Event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  
  if (this.isLoggingOut) return;
  this.isLoggingOut = true;
  
  // Limpiar usuario en UI
  this.currentUser = null;
  
  // Cerrar menú
  await this.menuCtrl.close('menu-content');
  
  // ⭐ ESPERAR a que signOut termine completamente
  await this.firebaseSvc.signOut();
  
  this.isLoggingOut = false;
}
}