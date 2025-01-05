"use client"

import React, { useState } from 'react'
import { useProducts } from '@/hooks/useProduct'
import { useFormat } from '@/hooks/useFormat'
import { ShoppingCart, Search } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
  } from "@/components/ui/pagination"
import { Loader2 } from 'lucide-react'
import { IProduct } from '@/types/Product.interface'
import { EditProductDialog } from '@/components/products/edit-product-dialog'
import { CreateProductDialog } from '@/components/products/create-product-dialog'
import { Input } from '@/components/ui/input'
import debounce from 'lodash/debounce'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useProducts({ page, limit: 25, search })
  const { formatCurrency, formatPercent } = useFormat()
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)

  const totalPages = data?.data.pagination.totalPages

  const debouncedSearch = debounce((value: string) => {
    setSearch(value)
    setPage(1)
  }, 300)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold font-dmSans flex items-center">
          <ShoppingCart className="w-6 h-6 mr-2" />
          Produits
        </h1>
        <CreateProductDialog />
      </div>

      {/* Search */}
      <div className="w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un produit..."
            className="pl-8 w-full"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table Card */}
      
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px] min-w-[200px]">
                  <p className='text-sm font-medium'>Nom</p>
                </TableHead>
                <TableHead className="w-full min-w-[300px]">
                  <p className='text-sm font-medium'>Description</p>
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px]">
                  <p className='text-sm font-medium'>TVA</p>
                </TableHead>
                <TableHead className="w-[120px] min-w-[120px]">
                  <p className='text-sm font-medium'>Prix HT</p>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                <div className="flex justify-center items-center h-full w-full">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
                </TableCell>
            </TableRow>
              ) : data?.data.products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-muted-foreground">Aucun produit trouvé</p>
                      {search && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Essayez de modifier votre recherche
                        </p>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.products.map((product: IProduct) => (
                  <TableRow 
                    key={product.product_id} 
                    className="cursor-pointer transition-colors"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <p className='text-sm text-muted-foreground line-clamp-2'>
                        {product.description || "Aucune description"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="flex items-center gap-2 w-fit">
                        {formatPercent(Number(product.vat_rate))}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className=" font-bold">
                        {formatCurrency(product.price_excluding_tax)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center py-4 border-t">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious className='hidden sm:flex cursor-pointer' onClick={() => setPage(p => Math.max(1, p - 1))} isActive={page !== 1} />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => {
                  // Afficher seulement les 3 pages autour de la page courante sur mobile
                  if (window.innerWidth < 640 && Math.abs(page - (i + 1)) > 1) {
                    return null;
                  }
                  return (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => setPage(i + 1)}
                        isActive={page === i + 1}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                <PaginationItem>
                  <PaginationNext className='hidden sm:flex cursor-pointer' onClick={() => setPage(p => Math.min(totalPages, p + 1))} isActive={page !== totalPages} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        

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