import { inject, Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { User } from '../models/user.model';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { getFirestore, setDoc, doc, getDoc } from '@angular/fire/firestore';
import { UtilsService } from './utils.service';
@Injectable({
  providedIn: 'root',
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilSvc = inject(UtilsService);
  //===== Autenticación =====

  getAuth() {
    return getAuth();
  }

  signOut() {
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilSvc.routerLink('/auth');
  }
  //==== Acceder ====
  // signIn(user: User){
  //   return this.auth.signInWithEmailAndPassword(user.email, user.password);
  // }

  //==== Acceder ====
  signIn(user: User) {
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //==== Crear Usuario  ====
  signUp(user: User) {
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }


  //==== Actualizar Usuario  ====
  updateUser(displayName: string) {

    return updateProfile(getAuth().currentUser, { displayName: displayName });

  }

  //==== Resetear Contraseña  ====

  sendRecoveryEmail(email: string) {
    return sendPasswordResetEmail(getAuth(), email);
  }


  //========================== base de datos ======================


  //==== Setear un documento  ====      

  setDocument(path: string, data: any) {

    return setDoc(doc(getFirestore(), path), data);
  }


  //==== Obtener un documento  ====

  async getDocument(path: string) {
    return (await getDoc(doc(getFirestore(), path))).data();

  }


}

// ==== Crear Documento de Usuario  ====

// set(displayName: string){
//   return updateProfile(getAuth().currentUser, {displayName: displayName});
// }