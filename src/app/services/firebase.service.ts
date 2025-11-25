  import { inject, Injectable } from '@angular/core';
  import { AngularFireAuth } from '@angular/fire/compat/auth';
  import { User } from '../models/user.model';
  import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail } from 'firebase/auth';
  import { AngularFirestore } from '@angular/fire/compat/firestore';
  import { getFirestore, setDoc, doc, getDoc, addDoc, collection, updateDoc, deleteDoc, collectionData, query } from '@angular/fire/firestore';
  import { UtilsService } from './utils.service';


  import { Product } from '../models/product.model';
  import { Observable } from 'rxjs';

  @Injectable({
    providedIn: 'root',
  })
  export class FirebaseService {

    auth = inject(AngularFireAuth);
    firestore = inject(AngularFirestore);
    utilSvc = inject(UtilsService);
    uploadImage: any;


    //===== Autenticación =====

    getAuth() {
      return getAuth();
    }

   // Cambiar este método:
async signOut() {
  // ⭐ ESPERAR a que Firebase cierre sesión completamente
  await getAuth().signOut();
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


    //==== obtener datos de una colección  ====


    getCollection(path: string, collectionQuery?: any) {
      const ref = collection(getFirestore(), path)
      return collectionData(query(ref, collectionQuery))
    }

    //==== Setear un documento  ====      

    setDocument(path: string, data: any) {

      return setDoc(doc(getFirestore(), path), data);
    }



    //==== Obtener un documento  ====

    async getDocument(path: string) {
      return (await getDoc(doc(getFirestore(), path))).data();

    }

      //==== Agregar un documento  ====

    addDocument(path: string, data: any) {

      return addDoc(collection(getFirestore(), path), data);
    }
  

      //========================== PRODUCTOS (vinculados al UID) ======================


  // colección de productos para un usuario
  private getUserProductsCollection(uid: string) {
    const db = getFirestore();
    return collection(db, `users/${uid}/products`);
  }

  // Crear producto para un usuario (almacenando media en base64)
  createProduct(
    uid: string,
    data: Omit<Product, 'id' | 'uid' | 'createdAt'>
  ): Promise<void> {
    const productsRef = this.getUserProductsCollection(uid);

    const product: Product = {
      ...data,
      uid,
      createdAt: Date.now(),
    };

    return addDoc(productsRef, product).then(() => {});
  }

  // Obtener todos los productos de un usuario
 getProducts(uid: string, queryConstraints?: any): Observable<Product[]> {
  const productsRef = this.getUserProductsCollection(uid);

  // Si vienen constraints (orderBy, where, etc.), los aplicamos
  if (queryConstraints && queryConstraints.length) {
    const q = query(productsRef, ...queryConstraints);
    return collectionData(q, { idField: 'id' }) as Observable<Product[]>;
  }

  // Si no vienen constraints, se comporta como antes
  return collectionData(productsRef, { idField: 'id' }) as Observable<Product[]>;
}

  // Actualizar producto
  updateProduct(
    uid: string,
    productId: string,
    data: Partial<Product>
  ): Promise<void> {
    const db = getFirestore();
    const productRef = doc(db, `users/${uid}/products/${productId}`);
    return updateDoc(productRef, data);
  }

  // Eliminar producto
  deleteProduct(uid: string, productId: string): Promise<void> {
    const db = getFirestore();
    const productRef = doc(db, `users/${uid}/products/${productId}`);
    return deleteDoc(productRef);
  }


  }

  // ==== Crear Documento de Usuario  ====

  // set(displayName: string){
  //   return updateProfile(getAuth().currentUser, {displayName: displayName});
  // }