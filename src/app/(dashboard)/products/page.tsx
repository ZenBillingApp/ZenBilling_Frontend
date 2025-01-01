"use client"

import React from 'react'
import { useProducts } from '@/hooks/useProduct'
import { useFormat } from '@/hooks/useFormat'

import {  ShoppingCart } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Card } from '@/components/ui/card'

import { Loader2 } from 'lucide-react'

import { IProduct } from '@/types/Product.interface'

export default function ProductsPage() {
  const { data, isLoading } = useProducts()
  const { formatCurrency, formatPercentage } = useFormat()

  if(isLoading) return <div className='flex justify-center items-center h-screen'><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold font-dmSans flex items-center">
            <ShoppingCart className="w-6 h-6 mr-2" />
            Produits
        </h1>

        <Card className="flex flex-col mt-6">
           <Table >
            <TableHeader>
                <TableRow>
                    
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Nom
                        </p>
                    </TableHead>
                    <TableHead className='w-1/2'>
                        <p className='text-sm font-medium text-nowrap'>
                            Description
                        </p>
                    </TableHead>
                    <TableHead>
                      <p className='text-sm font-medium text-nowrap'>
                        Taux de TVA
                      </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Prix
                        </p>
                    </TableHead>
                   
                    
                </TableRow>
            </TableHeader>
            <TableBody>
                {data?.data.map((product: IProduct) => (
                    <TableRow key={product.product_id} className="hover:bg-gray-100 cursor-pointer">

                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {product.name}
                            </p>
                        </TableCell>

                        <TableCell>
                            <p className='text-sm font-medium text-ellipsis overflow-hidden line-clamp-3'>
                            {product.description}
                            </p>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {formatPercentage(product.vat_rate)}
                            </p>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {formatCurrency(product.price_excluding_tax)}
                            </p>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
           </Table>
        </Card>
    </div>
  )
}