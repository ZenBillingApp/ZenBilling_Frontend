import { IProduct, ProductUnit, VatRate } from "./Product.interface";

export interface IInvoiceItem {
  item_id?: number;
  invoice_id: number;
  product_id: number;
  name: string;
  description?: string;
  quantity: number;
  unit: ProductUnit;
  unit_price_excluding_tax: number;
  vat_rate: VatRate;
  product?: IProduct;
} 