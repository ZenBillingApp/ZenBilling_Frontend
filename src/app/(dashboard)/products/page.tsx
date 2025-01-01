"use client"

import React, { useState } from 'react'
import { useProducts } from '@/hooks/useProduct'
import { useFormat } from '@/hooks/useFormat'
import { ShoppingCart } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { IProduct } from '@/types/Product.interface'
import { EditProductDialog } from '@/components/products/edit-product-dialog'
import { CreateProductDialog } from '@/components/products/create-product-dialog'

export default function ProductsPage() {
  const { data, isLoading } = useProducts()
  const { formatCurrency, formatPercentage } = useFormat()
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  if(isLoading) return <div className='flex justify-center items-center h-screen'>
    <Loader2 className="w-6 h-6 animate-spin" />
  </div>

  return (
    <div className="p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-dmSans flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2" />
          Produits
        </h1>
        <CreateProductDialog />
      </div>

      <Card className="flex flex-col mt-6">
        <Table>
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
                  Prix HT
                </p>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data.map((product: IProduct) => (
              <TableRow 
                key={product.product_id} 
                className="hover:bg-gray-100 cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
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
                    {formatPercentage(Number(product.vat_rate))}
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

      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}