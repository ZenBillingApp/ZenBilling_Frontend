"use client"

import React from 'react'
import { useInvoices } from '@/hooks/useInvoice'
import { useFormat } from '@/hooks/useFormat'

import { FileStack, ShoppingCart } from 'lucide-react'

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Badge } from "@/components/ui/badge"
  import { Card } from '@/components/ui/card'

import { Loader2 } from 'lucide-react'

import { IInvoice } from '@/types/Invoice.interface'

import { User, Building,CalendarDays,Clock,MoveRight } from 'lucide-react'

export default function InvoicesPage() {
  const { data, isLoading } = useInvoices()
  const { formatCurrency } = useFormat()

  if(isLoading) return <div className='flex justify-center items-center h-screen'><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold font-dmSans flex items-center">
            <FileStack className="w-6 h-6 mr-2" />
            Factures
        </h1>

        <Card className="flex flex-col mt-6">
           <Table >
            <TableHeader>
                <TableRow>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Type
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            N° Facture
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Nom
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Statut
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Nb. Produits
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Date
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Total
                        </p>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data?.map((invoice: IInvoice) => (
                    <TableRow key={invoice.invoice_id} className="hover:bg-gray-100 cursor-pointer">
                        <TableCell>
                           
                                {invoice.Customer?.type === 'company' ? 
                                <Building className="w-4 h-4" />
                            :
                                <User className="w-4 h-4" />
                            }
                          
                            
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {invoice.invoice_number}</p>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {invoice.Customer?.BusinessCustomer?.name}
                            </p>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline">{invoice.status}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <Badge variant="outline" className="flex items-center gap-2 ">
                                <ShoppingCart className="w-4 h-4" />
                                {invoice.InvoiceItems?.length}
                                   
                                </Badge>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                                <CalendarDays className="w-4 h-4" color='gray' />
                                <p>{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4"  color='gray' />
                                    <MoveRight className="w-4 h-4" color='gray' />
                                </div>
                                

                                <p>{new Date(invoice.due_date).toLocaleDateString()}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {formatCurrency(invoice.amount_including_tax)}
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