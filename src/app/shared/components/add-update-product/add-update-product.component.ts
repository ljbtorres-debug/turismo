import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/models/product.model';
import { User } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-update-product',
  templateUrl: './add-update-product.component.html',
  styleUrls: ['./add-update-product.component.scss'],
  standalone: false
})
export class AddUpdateProductComponent implements OnInit {

  @Input() product: Product;

  form = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required, Validators.minLength(4)]),
    price: new FormControl(null, [Validators.required, Validators.min(0)]),
    soldUnits: new FormControl(null, [Validators.required, Validators.min(0)]),
    imageBase64: new FormControl<string | null>(null, Validators.required),
  });

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user = {} as User;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user') as User;
    
    // Si estamos editando, cargar los datos del producto en el formulario
    if (this.product) {
      this.form.patchValue({
        id: this.product.id,
        name: this.product.name,
        price: this.product.price,
        soldUnits: this.product.soldUnits,
        imageBase64: this.product.imageBase64
      });
    }
  }

  

  async takeImage() {
    const photo = await this.utilsSvc.takePicture('Imagen de Producto');
    this.form.controls.imageBase64.setValue(photo.dataUrl); 
  }

  submit() {
    if (this.form.valid) {
      if(this.product) this.updateProduct();
      else this.createProduct();
    }
  }

  async createProduct() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.utilsSvc.loading();
    await loading.present();

    delete this.form.value.id;

    try {
      await this.firebaseSvc.createProduct(this.user.uid, {
        name: this.form.value.name!,
        price: Number(this.form.value.price),
        soldUnits: Number(this.form.value.soldUnits),
        imageBase64: this.form.value.imageBase64!,
      });

      this.utilsSvc.dismissModal({ success: true });

      this.utilsSvc.presentToast({
        message: 'Producto agregado correctamente',
        duration: 2500,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 1700,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  async updateProduct() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const loading = await this.utilsSvc.loading();
    await loading.present();

    try {
      const newImage = this.form.value.imageBase64;
      const imageChanged = newImage !== this.product.imageBase64;

      const updateData: any = {
        name: this.form.value.name!,
        price: Number(this.form.value.price),
        soldUnits: Number(this.form.value.soldUnits),
        imageBase64: imageChanged ? newImage : this.product.imageBase64
      };

      await this.firebaseSvc.updateProduct(
        this.user.uid,
        this.product.id,
        updateData
      );

      this.utilsSvc.dismissModal({ success: true });

      this.utilsSvc.presentToast({
        message: 'Producto actualizado correctamente',
        duration: 2500,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-circle-outline'
      });

    } catch (error: any) {
      console.error(error);
      this.utilsSvc.presentToast({
        message: error.message,
        duration: 1700,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      });
    } finally {
      loading.dismiss();
    }
  }

  
}