"use client"

import { useMemo } from 'react'

export const useFormat = () => {
    const formatters = useMemo(() => ({
        currency: new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }),
        
        percent: new Intl.NumberFormat('fr-FR', {
            style: 'percent',
            minimumFractionDigits: 1,
            maximumFractionDigits: 1
        }),
        
        decimal: new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }),
        
        quantity: new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        })
    }), [])

    return {
        formatCurrency: (value: number) => formatters.currency.format(value),
        formatPercent: (value: number) => formatters.percent.format(value / 100),
        formatDecimal: (value: number) => formatters.decimal.format(value),
        formatQuantity: (value: number) => formatters.quantity.format(value)
    }
} 