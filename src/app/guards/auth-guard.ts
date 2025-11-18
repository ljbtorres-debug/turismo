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
export class AuthGuard implements CanActivate {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {

    return new Promise((resolve) => {
      const auth = this.firebaseSvc.getAuth();

      // IMPORTANTE: capturamos el unsubscribe
      const unsubscribe = auth.onAuthStateChanged(
        (user) => {
          // dejamos de escuchar inmediatamente
          unsubscribe();

          if (user) {
            // Si no hay 'user' en localStorage, lo creamos mínimo
            if (!localStorage.getItem('user')) {
              localStorage.setItem(
                'user',
                JSON.stringify({
                  uid: user.uid,
                  email: user.email,
                })
              );
            }
            resolve(true);
          } else {
            this.utilsSvc.routerLink('/auth');
            resolve(false);
          }
        },
        (error) => {
          console.error('AuthGuard error:', error);
          unsubscribe();
          this.utilsSvc.routerLink('/auth');
          resolve(false);
        }
      );
    });
  }
}
