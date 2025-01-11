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
import { Pencil, Loader2, Building, User, Mail, Phone, MapPin } from "lucide-react"
import { ICustomer } from "@/types/Customer.interface"
import { useCustomer } from "@/hooks/useCustomer"

interface CustomerDetailsDialogProps {
  customer: ICustomer | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onEdit: () => void
}

export function CustomerDetailsDialog({ 
  customer, 
  isOpen, 
  onOpenChange,
  onEdit 
}: CustomerDetailsDialogProps) {
  const { data: customerDetails, isLoading } = useCustomer(customer?.customer_id || 0)

  if (!customer) return null

  const displayCustomer = customerDetails?.data || customer

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pt-4 sm:pt-6">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-lg sm:text-xl">Détails du client</DialogTitle>
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
                <div className="grid gap-4">
                  {/* Type de client et informations principales */}
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="mt-1">
                      {displayCustomer.type === 'company' ? (
                        <Building className="w-4 h-4" />
                      ) : (
                        <User className="w-4 h-4" />
                      )}
                    </Badge>
                    <div className="flex-1">
                      <h3 className="font-medium">
                        {displayCustomer.type === 'company'
                          ? displayCustomer.BusinessCustomer?.name
                          : `${displayCustomer.IndividualCustomer?.first_name} ${displayCustomer.IndividualCustomer?.last_name}`}
                      </h3>
                      {displayCustomer.type === 'company' && (
                        <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                          {displayCustomer.BusinessCustomer?.siret && (
                            <p>SIRET : {displayCustomer.BusinessCustomer.siret}</p>
                          )}
                          {displayCustomer.BusinessCustomer?.siren && (
                            <p>SIREN : {displayCustomer.BusinessCustomer.siren}</p>
                          )}
                          {displayCustomer.BusinessCustomer?.tva_intra && (
                            <p>N° TVA : {displayCustomer.BusinessCustomer.tva_intra}</p>
                          )}
                          <p>TVA Applicable : {displayCustomer.BusinessCustomer?.tva_applicable ? 'Oui' : 'Non'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Contact</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {displayCustomer.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-4 h-4 shrink-0" />
                          <span>{displayCustomer.email}</span>
                        </div>
                      )}
                      {displayCustomer.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-4 h-4 shrink-0" />
                          <span>{displayCustomer.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Adresse */}
                  {(displayCustomer.address || displayCustomer.city || displayCustomer.postal_code) && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Adresse</h4>
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          {displayCustomer.address && <p>{displayCustomer.address}</p>}
                          <p>
                            {displayCustomer.postal_code} {displayCustomer.city}
                          </p>
                          {displayCustomer.country && <p>{displayCustomer.country}</p>}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Créé le</span>
                      <span className="font-medium">
                        {new Date(displayCustomer.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-muted-foreground">Dernière modification</span>
                      <span className="font-medium">
                        {new Date(displayCustomer.updatedAt).toLocaleDateString()}
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