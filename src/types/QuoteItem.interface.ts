import { IProduct, ProductUnit, VatRate } from "./Product.interface";

export interface IQuoteItem {
  item_id?: number;
  quote_id: number;
  product_id?: number | null;
  name: string | null;
  description?: string | null;
  quantity: number;
  unit: ProductUnit;
  unit_price_excluding_tax: number;
  vat_rate: VatRate;
  product?: IProduct;
} 