"use client"

import { useState, useEffect } from 'react'
import NiceModal, { useModal } from '@ebay/nice-modal-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ICreateCustomerRequest } from '@/types/Customer.request.interface'
import { useCreateCustomer } from '@/hooks/useCustomer'
import { useForm } from 'react-hook-form'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Building, Loader2 } from 'lucide-react'
import { AxiosError } from 'axios'
import { ScrollArea } from "@/components/ui/scroll-area"

const individualSchema = z.object({
  first_name: z.string().min(2, 'Prénom requis').max(100, 'Prénom trop long'),
  last_name: z.string().min(2, 'Nom requis').max(100, 'Nom trop long'),
})

const businessSchema = z.object({
  name: z.string().min(2, 'Nom de l\'entreprise requis').max(200, 'Nom trop long'),
  siret: z.string().length(14, 'SIRET doit contenir 14 chiffres').regex(/^\d+$/, 'SIRET invalide'),
  siren: z.string().length(9, 'SIREN doit contenir 9 chiffres').regex(/^\d+$/, 'SIREN invalide'),
  tva_intra: z.string().optional().nullable(),
  tva_applicable: z.boolean().default(false),
})

const formSchema = z.object({
  type: z.enum(['individual', 'company']),
  email: z.string().email('Email invalide').min(1, 'Email requis'),
  phone: z.string().optional(),
  address: z.string().min(1, 'Adresse requise'),
  city: z.string().min(1, 'Ville requise'),
  postal_code: z.string().regex(/^\d{5}$/, 'Code postal invalide'),
  country: z.string().default('France'),
  individual: individualSchema.nullable(),
  business: businessSchema.nullable(),
}).superRefine((data, ctx) => {
  if (data.type === 'individual' && !data.individual) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Les informations du particulier sont requises",
      path: ["individual"]
    });
  }
  if (data.type === 'company' && !data.business) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Les informations de l'entreprise sont requises",
      path: ["business"]
    });
  }
});

type FormData = z.infer<typeof formSchema>;

interface ApiError {
  field?: string;
  message: string;
}

interface ApiErrorResponse {
  errors?: ApiError[];
}

export default NiceModal.create(() => {
  const modal = useModal()
  const [customerType, setCustomerType] = useState<'individual' | 'company'>('individual')
  const [apiErrors, setApiErrors] = useState<ApiError[]>([])
  const createCustomerMutation = useCreateCustomer()

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: customerType,
      email: '',
      phone: '',
      address: '',
      city: '',
      postal_code: '',
      country: 'France',
      individual: {
        first_name: '',
        last_name: ''
      },
      business: null
    }
  })

  useEffect(() => {
    setValue('type', customerType)
    if (customerType === 'individual') {
      setValue('business', null)
      setValue('individual', { first_name: '', last_name: '' })
    } else {
      setValue('individual', null)
      setValue('business', {
        name: '',
        siret: '',
        siren: '',
        tva_applicable: false,
        tva_intra: ''
      })
    }
  }, [customerType, setValue])

  const onSubmit = async (data: FormData) => {
    setApiErrors([])
    try {
      const formattedData = {
        ...data,
        type: customerType,
        ...(customerType === 'individual' ? {
          individual: data.individual,
          business: undefined
        } : {
          business: data.business,
          individual: undefined
        })
      }

      await createCustomerMutation.mutate(
        formattedData as ICreateCustomerRequest,
        {

          onSuccess: () => {
            reset()
            setApiErrors([])
            modal.hide()
          },
          onError: (error: Error) => {
            const axiosError = error as AxiosError<ApiErrorResponse>;
            if (axiosError.response?.data?.errors) {
              setApiErrors(axiosError.response.data.errors)
            }
          }
        }
      )
    } catch (error) {
      console.error('Erreur lors de la création:', error)
    }
  }

  const handleClose = () => {
    reset()
    setCustomerType('individual')
    setApiErrors([])
    modal.hide()
  }

  return (
    <Dialog open={modal.visible} onOpenChange={handleClose}>
      <DialogContent className="max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Créer un client</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)]">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-6 pb-6">
              <Tabs
                defaultValue={customerType}
                onValueChange={(value: string) => {
                  if (value === "individual" || value === "company") {
                    setCustomerType(value);
                  }
                }}
                className="w-full space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="individual" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Particulier
                  </TabsTrigger>
                  <TabsTrigger value="company" className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Professionnel
                  </TabsTrigger>
                </TabsList>

                {apiErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTitle>Erreurs</AlertTitle>
                    <AlertDescription>
                      {apiErrors.map((error, index) => (
                        <p key={index} >
                          {error.field ? `${error.message}` : error.message}
                      </p>
                    ))}
                  </AlertDescription>
                </Alert>
                )}

                <TabsContent value="individual">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="first_name">Prénom</Label>
                      <Input id="first_name" {...register('individual.first_name')} />
                      {errors.individual?.first_name && (
                        <p className="text-red-500 text-xs italic">{errors.individual.first_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="last_name">Nom</Label>
                      <Input id="last_name" {...register('individual.last_name')} />
                      {errors.individual?.last_name && (
                        <p className="text-red-500 text-xs italic">{errors.individual.last_name.message}</p>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="company">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="name">Nom de l&apos;entreprise</Label>
                      <Input id="name" {...register('business.name')} />
                      {errors.business?.name && (
                        <p className="text-red-500 text-xs italic">{errors.business.name.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label htmlFor="siret">SIRET</Label>
                        <Input id="siret" {...register('business.siret')} />
                        {errors.business?.siret && (
                          <p className="text-red-500 text-xs italic">{errors.business.siret.message}</p>
                        )}
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="siren">SIREN</Label>
                        <Input id="siren" {...register('business.siren')} />
                        {errors.business?.siren && (
                          <p className="text-red-500 text-xs italic">{errors.business.siren.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="tva_intra">N° TVA Intracommunautaire</Label>
                      <Input id="tva_intra" {...register('business.tva_intra')} />
                      {errors.business?.tva_intra && (
                        <p className="text-red-500 text-xs italic">{errors.business.tva_intra.message}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="tva_applicable" {...register('business.tva_applicable')} defaultChecked={false} onCheckedChange={(checked) => setValue('business.tva_applicable', checked)} />
                      <Label htmlFor="tva_applicable">TVA Applicable</Label>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && <p className="text-red-500 text-xs italic">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" {...register('phone')} />
                  {errors.phone && <p className="text-red-500 text-xs italic">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="address">Adresse</Label>
                  <Input id="address" {...register('address')} />
                  {errors.address && <p className="text-red-500 text-xs italic">{errors.address.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" {...register('city')} />
                    {errors.city && <p className="text-red-500 text-xs italic">{errors.city.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="postal_code">Code postal</Label>
                    <Input id="postal_code" {...register('postal_code')} />
                    {errors.postal_code && (
                      <p className="text-red-500 text-xs italic">{errors.postal_code.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" {...register('country')} />
                  {errors.country && <p className="text-red-500 text-xs italic">{errors.country.message}</p>}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={handleClose} disabled={createCustomerMutation.isPending}>
                  Annuler
                </Button>
                <Button type="submit" disabled={createCustomerMutation.isPending}>
                  {createCustomerMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Création...
                    </>
                  ) : (
                    'Créer'
                  )}
                </Button>
              </div>
            </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}) 