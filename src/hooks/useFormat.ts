"use client"

interface FormatOptions {
  locale?: string;
  currency?: string;
}

export function useFormat(options: FormatOptions = {}) {
  const {
    locale = 'fr-FR',
    currency = 'EUR'
  } = options;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value / 100);
  };

  const formatQuantity = (value: number) => {
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return {
    formatCurrency,
    formatPercentage,
    formatQuantity,
  };
} 