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
import { ProductDetailsDialog } from '@/components/products/product-details-dialog'
import { Input } from '@/components/ui/input'
import debounce from 'lodash/debounce'

export default function ProductsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const { data, isLoading } = useProducts({ page, limit: 25, search })
  const { formatCurrency, formatPercent } = useFormat()
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const totalPages = data?.data.pagination.totalPages

  const debouncedSearch = debounce((value: string) => {
    setSearch(value)
    setPage(1)
  }, 300)

  const handleEditProduct = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsEditDialogOpen(true)
  }

  const handleEditSuccess = () => {

    setIsEditDialogOpen(false)
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
          <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Produits
        </h1>
        <div className="w-full sm:w-auto">
          <CreateProductDialog />
        </div>
      </div>

      {/* Search */}
      <div className="w-full">
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
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="min-w-full inline-block align-middle">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] min-w-[150px]">
                    <p className='text-sm font-medium'>Nom</p>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell w-full min-w-[200px]">
                    <p className='text-sm font-medium'>Description</p>
                  </TableHead>
                  <TableHead className="w-[80px] min-w-[80px]">
                    <p className='text-sm font-medium'>TVA</p>
                  </TableHead>
                  <TableHead className="w-[100px] min-w-[100px]">
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
                      className="cursor-pointer transition-colors hover:bg-muted/50"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <p className='text-sm text-muted-foreground line-clamp-2'>
                          {product.description || "Aucune description"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="flex items-center justify-center w-fit">
                          {formatPercent(Number(product.vat_rate))}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold whitespace-nowrap">
                          {formatCurrency(product.price_excluding_tax)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center py-4 border-t">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  className='hidden sm:flex cursor-pointer' 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  isActive={page !== 1} 
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
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
                <PaginationNext 
                  className='hidden sm:flex cursor-pointer' 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  isActive={page !== totalPages} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Product Details Dialog */}
      <ProductDetailsDialog
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onOpenChange={(open) => !open && setSelectedProduct(null)}
        onEdit={handleEditProduct}
      />

      {/* Edit Product Dialog */}
      {selectedProduct && (
        <EditProductDialog
          product={selectedProduct}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false)
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  )
}