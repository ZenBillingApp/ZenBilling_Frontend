"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pencil, Loader2 } from "lucide-react"
import { IProduct } from "@/types/Product.interface"
import { useFormat } from "@/hooks/useFormat"
import { useProductDetails } from "@/hooks/useProduct"

interface ProductDetailsDialogProps {
  product: IProduct | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onEdit: (e: React.MouseEvent) => void
}

export function ProductDetailsDialog({ 
  product, 
  isOpen, 
  onOpenChange,
  onEdit 
}: ProductDetailsDialogProps) {
  const { formatCurrency, formatPercent } = useFormat()
  const { data: productDetails, isLoading } = useProductDetails(product?.product_id || 0)

  if (!product) return null

  const displayProduct = productDetails?.data || product

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pt-4 sm:pt-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg sm:text-xl">Détails du produit</DialogTitle>
            <Button variant="outline" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <div className="grid gap-3 sm:gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Nom</span>
                    <span className="font-medium break-words">{displayProduct.name}</span>
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Description</span>
                    <span className="font-medium break-words">{displayProduct.description || "Aucune description"}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Prix HT</span>
                      <span className="font-medium">{formatCurrency(displayProduct.price_excluding_tax)}</span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">TVA</span>
                      <Badge variant="outline" className="w-fit mt-1">
                        {formatPercent(displayProduct.vat_rate)}
                      </Badge>
                    </div>
                  </div>

                  {displayProduct.unit && (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Unité</span>
                      <Badge variant="outline" className="w-fit mt-1">
                        {displayProduct.unit}
                      </Badge>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Créé le</span>
                      <span className="font-medium">
                        {displayProduct?.createdAt ? new Date(displayProduct.createdAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Dernière modification</span>
                      <span className="font-medium">
                        {displayProduct?.updatedAt ? new Date(displayProduct.updatedAt).toLocaleDateString() : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
} 