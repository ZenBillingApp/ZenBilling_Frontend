export interface IInvoiceItem {
  item_id?: number;
  invoice_id: number;
  product_id: number;
  quantity: number;
  unit_price_excluding_tax: number;
  vat_rate: number;
} 