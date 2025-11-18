import { Injectable, inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { FirebaseService } from '../services/firebase.service';
import { UtilsService } from '../services/utils.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {

    return new Promise((resolve) => {
      const auth = this.firebaseSvc.getAuth();

      const unsubscribe = auth.onAuthStateChanged(
        (user) => {
          unsubscribe();

          if (user) {
            // Ya está logueado: no tiene sentido ir a /auth
            this.utilsSvc.routerLink('/main/home');
            resolve(false);
          } else {
            resolve(true);
          }
        },
        (error) => {
          console.error('NoAuthGuard error:', error);
          unsubscribe();
          // Si hay error, por seguridad dejamos entrar a /auth
          resolve(true);
        }
      );
    });
  }
}
