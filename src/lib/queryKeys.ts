/**
 * Query Key Factories
 *
 * Centralise la création des query keys pour TanStack Query.
 * Chaque factory inclut l'organization_id pour isoler les données par organisation.
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/community/lukemorales-query-key-factory
 */

import type { ICustomerQueryParams } from "@/types/Customer.request.interface";
import type { IInvoiceQueryParams } from "@/types/Invoice.request.interface";
import type { IProductQueryParams } from "@/types/Product.request.interface";
import type { IQuoteQueryParams } from "@/types/Quote.request.interface";

export const queryKeys = {
  /**
   * Query keys pour les customers
   */
  customers: {
    all: (organizationId: string | undefined) => ["customers", organizationId] as const,
    lists: (organizationId: string | undefined) => [...queryKeys.customers.all(organizationId), "list"] as const,
    list: (organizationId: string | undefined, params: ICustomerQueryParams) =>
      [...queryKeys.customers.lists(organizationId), params] as const,
    details: (organizationId: string | undefined) => [...queryKeys.customers.all(organizationId), "detail"] as const,
    detail: (organizationId: string | undefined, customerId: string) =>
      [...queryKeys.customers.details(organizationId), customerId] as const,
  },

  /**
   * Query keys pour les invoices
   */
  invoices: {
    all: (organizationId: string | undefined) => ["invoices", organizationId] as const,
    lists: (organizationId: string | undefined) => [...queryKeys.invoices.all(organizationId), "list"] as const,
    list: (organizationId: string | undefined, params: IInvoiceQueryParams) =>
      [...queryKeys.invoices.lists(organizationId), params] as const,
    details: (organizationId: string | undefined) => [...queryKeys.invoices.all(organizationId), "detail"] as const,
    detail: (organizationId: string | undefined, invoiceId: string) =>
      [...queryKeys.invoices.details(organizationId), invoiceId] as const,
    customerInvoices: (organizationId: string | undefined, customerId: string, params: IInvoiceQueryParams) =>
      [...queryKeys.invoices.all(organizationId), "customer", customerId, params] as const,
  },

  /**
   * Query keys pour les products
   */
  products: {
    all: (organizationId: string | undefined) => ["products", organizationId] as const,
    lists: (organizationId: string | undefined) => [...queryKeys.products.all(organizationId), "list"] as const,
    list: (organizationId: string | undefined, params: IProductQueryParams) =>
      [...queryKeys.products.lists(organizationId), params] as const,
    details: (organizationId: string | undefined) => [...queryKeys.products.all(organizationId), "detail"] as const,
    detail: (organizationId: string | undefined, productId: string) =>
      [...queryKeys.products.details(organizationId), productId] as const,
    units: () => ["product-units"] as const,
    vatRates: () => ["product-vat-rates"] as const,
  },

  /**
   * Query keys pour les quotes
   */
  quotes: {
    all: (organizationId: string | undefined) => ["quotes", organizationId] as const,
    lists: (organizationId: string | undefined) => [...queryKeys.quotes.all(organizationId), "list"] as const,
    list: (organizationId: string | undefined, params: IQuoteQueryParams) =>
      [...queryKeys.quotes.lists(organizationId), params] as const,
    details: (organizationId: string | undefined) => [...queryKeys.quotes.all(organizationId), "detail"] as const,
    detail: (organizationId: string | undefined, quoteId: string) =>
      [...queryKeys.quotes.details(organizationId), quoteId] as const,
    customerQuotes: (organizationId: string | undefined, customerId: string, params: IQuoteQueryParams) =>
      [...queryKeys.quotes.all(organizationId), "customer", customerId, params] as const,
  },

  /**
   * Query keys pour le dashboard
   */
  dashboard: {
    all: (organizationId: string | undefined) => ["dashboard", organizationId] as const,
    metrics: (organizationId: string | undefined) => [...queryKeys.dashboard.all(organizationId), "metrics"] as const,
  },

  /**
   * Query keys pour la company
   */
  company: {
    all: (organizationId: string | undefined) => ["company", organizationId] as const,
    legalForms: () => ["legalForm"] as const,
  },
};
