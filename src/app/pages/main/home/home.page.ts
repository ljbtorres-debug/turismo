import { Component, inject } from '@angular/core';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddUpdateProductComponent } from 'src/app/shared/components/add-update-product/add-update-product.component';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { Subscription } from 'rxjs';
import { orderBy } from 'firebase/firestore';
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage {

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  products: Product[] = [];
  loading: boolean = false;
  private productsSub?: Subscription;

  // ===== Getter de usuario (igual que en tu screenshot) =====
  user(): User | null {
    return this.utilsSvc.getFromLocalStorage('user') as User | null;
  }

  // ===== Ciclo de vida de Ionic =====
  ionViewWillEnter() {
    this.getProducts();
  }

  // Rfresh de productos
  doRefresh(event) {


    setTimeout(() => {
      this.getProducts();
      event.target.complete();
    }, 1000);
  }

  getProfits() {
    return this.products.reduce((index, product) => index + (product.price * product.soldUnits), 0);
  }


  // ===== Obtener productos =====
  getProducts() {

    const user = this.user();
    const uid = user?.uid;
    this.loading = true;

    // ⭐ Cambio mínimo: el query debe ser un array de constraints
    let query = [
      orderBy('soldUnits', 'desc')
    ];

    if (!uid) {
      console.warn('No hay usuario en localStorage');
      return;
    }

    

    // ⭐ Mantengo tu variable path, lista para usarla más adelante
    const path = `users/${uid}/products`;
    console.log('Ruta de productos:', path);

    // Nos aseguramos de no dejar subscripciones colgando
    this.productsSub?.unsubscribe();

    this.productsSub = this.firebaseSvc.getProducts(uid, query).subscribe({
      next: (res: Product[]) => {
        console.log('Productos recibidos:', res);
        this.products = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
      }
    });
  }


  // Opcional: limpiar sub cuando la vista sale
  ionViewWillLeave() {
    this.productsSub?.unsubscribe();
  }

  // //===== Cerrar sesión ======
  // signOut() {
  //   this.firebaseSvc.signOut();
  // }

  //====== Agregar o actualizar un producto ======
  addUpdateProduct(product?: Product) {
    this.utilsSvc.presentModal({
      component: AddUpdateProductComponent,
      cssClass: 'add-update-modal',
      componentProps: { product }
    });
  }

  //===== Alerta de eliminacion

  async confirmDeleteProduct(product: Product) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar Producto',
      message: '¿Quieres eliminar este producto?',
      mode: 'ios',
      buttons: [
        {
          text: 'Cancelar',

        }, {
          text: 'Eliminar',
          handler: () => {
            this.deleteProduct(product)
          }
        }
      ]
    });


  }


  async deleteProduct(product: Product) {

    // Si falta el id o el usuario, no hacemos nada
    const localUser = this.utilsSvc.getFromLocalStorage('user') as User | null;
    const uid = localUser?.uid;
    if (!uid || !product.id) return;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      await this.firebaseSvc.deleteProduct(uid, product.id);

      this.utilsSvc.presentToast({
        message: 'Producto eliminado correctamente',
        duration: 2500,
        color: 'danger',
        icon: 'checkmark-circle-outline',
        position: 'bottom'
      });

    } catch (error: any) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: error.message || 'Error al eliminar el producto',
        duration: 2000,
        color: 'danger',
        icon: 'alert-circle-outline',
        position: 'bottom'
      });
    } finally {
      loading.dismiss();
    }
  }

}
