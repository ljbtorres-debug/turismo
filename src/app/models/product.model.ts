export interface Product {
  id?: string;
  uid: string;
  name: string;
  price: number;
  description?: string;
  imageBase64?: string;
  audioBase64?: string;
  videoBase64?: string;
  soldUnits?: number;     // 👈 AGREGA ESTA LÍNEA
  createdAt: number;
}
