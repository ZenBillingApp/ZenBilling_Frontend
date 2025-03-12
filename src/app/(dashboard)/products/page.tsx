"use client";

import React, { useState } from "react";

import { useProducts } from "@/hooks/useProduct";
import { useFormat } from "@/hooks/useFormat";
import { useDebounce } from "@/hooks/useDebounce";

import { vatRateToNumber, IProduct } from "@/types/Product.interface";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EditProductDialog } from "@/components/products/edit-product-dialog";
import { CreateProductDialog } from "@/components/products/create-product-dialog";
import { ProductDetailsDialog } from "@/components/products/product-details-dialog";
import { Input } from "@/components/ui/input";

import { ShoppingCart, Search, Loader2, Plus, Info } from "lucide-react";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  
  const { data, isLoading } = useProducts({ 
    page, 
    limit: 25, 
    search: debouncedSearch 
  });
  
  const { formatCurrency, formatPercent } = useFormat();
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const totalPages = data?.data.pagination.totalPages || 1;

  const handleEditProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
  };

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 space-y-4 sm:space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold font-dmSans flex items-center">
          <ShoppingCart className="w-5 sm:w-6 h-5 sm:h-6 mr-2" />
          Produits
        </h1>
        <CreateProductDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          trigger={<Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau produit
          </Button>}
        />
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un produit..."
          className="pl-8 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : data?.data.products.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <ShoppingCart className="mx-auto h-10 sm:h-12 w-10 sm:w-12 text-muted-foreground" />
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-medium">Aucun produit</h3>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-muted-foreground">
            Commencez par créer un nouveau produit.
          </p>
          <div className="mt-4 sm:mt-6">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau produit
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Vue mobile (uniquement sur xs) */}
          <div className="block sm:hidden space-y-4">
            {data?.data.products.map((product: IProduct) => (
              <div 
                key={product.product_id}
                className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-sm">{product.name}</p>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 max-w-[200px]">
                        {product.description}
                      </p>
                    )}
                  </div>
                  <Badge
                    variant="outline"
                    className="flex items-center justify-center text-xs"
                  >
                    {formatPercent(vatRateToNumber(product.vat_rate))}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t">
                  <p className="font-bold text-sm">
                    {formatCurrency(product.price_excluding_tax)}
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                  >
                    <Info className="w-3 h-3 mr-1" />
                    <span className="text-xs">Détails</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Vue desktop (à partir de sm) */}
          <div className="hidden sm:block overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px] min-w-[150px]">
                    <p className="text-sm font-medium">Nom</p>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell w-full min-w-[200px]">
                    <p className="text-sm font-medium">Description</p>
                  </TableHead>
                  <TableHead className="w-[80px] min-w-[80px]">
                    <p className="text-sm font-medium">TVA</p>
                  </TableHead>
                  <TableHead className="w-[100px] min-w-[100px]">
                    <p className="text-sm font-medium">Prix HT</p>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data.products.map((product: IProduct) => (
                  <TableRow
                    key={product.product_id}
                    className="cursor-pointer transition-colors hover:bg-muted/50"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {product.description || "Aucune description"}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex items-center justify-center w-fit"
                      >
                        {formatPercent(vatRateToNumber(product.vat_rate))}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold whitespace-nowrap">
                        {formatCurrency(product.price_excluding_tax)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 sm:mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  isActive={page !== 1}
                />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => {
                // Sur mobile, n'afficher que la page actuelle et les pages adjacentes
                if (
                  (window.innerWidth < 640 && Math.abs(page - (i + 1)) > 1) ||
                  (totalPages > 7 && i > 0 && i < totalPages - 1 && Math.abs(page - (i + 1)) > 2)
                ) {
                  // Afficher des points de suspension au milieu
                  if (i === 1 && page > 3) {
                    return (
                      <PaginationItem key="ellipsis-start" className="flex items-center justify-center h-10 w-10">
                        <span>...</span>
                      </PaginationItem>
                    );
                  }
                  if (i === totalPages - 2 && page < totalPages - 2) {
                    return (
                      <PaginationItem key="ellipsis-end" className="flex items-center justify-center h-10 w-10">
                        <span>...</span>
                      </PaginationItem>
                    );
                  }
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
                  className="cursor-pointer"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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
            setIsEditDialogOpen(false);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
