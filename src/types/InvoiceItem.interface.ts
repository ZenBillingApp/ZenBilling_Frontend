import { IProduct, ProductUnit, VatRate } from "./Product.interface";

export interface IInvoiceItem {
  item_id?: string;
  invoice_id: string;
  product_id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: ProductUnit;
  unit_price_excluding_tax: number;
  vat_rate: VatRate;
  product?: IProduct;
} 