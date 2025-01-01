"use client"

import React from 'react'
import { useCustomers } from '@/hooks/useCustomer'


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
  import { Card } from '@/components/ui/card'

import { Loader2, MapPin } from 'lucide-react'

import { ICustomer } from '@/types/Customer.interface'

import { User, Building,User2Icon } from 'lucide-react'

export default function CustomersPage() {
  const { data, isLoading } = useCustomers()

  if(isLoading) return <div className='flex justify-center items-center h-screen'><Loader2 className="w-6 h-6 animate-spin" /></div>

  return (
    <div className="p-6">
        <h1 className="text-2xl font-bold font-dmSans flex items-center">
            <User2Icon className="w-6 h-6 mr-2" />
            Clients
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
                            Nom
                        </p>
                    </TableHead>
                    <TableHead> 
                        <p className='text-sm font-medium text-nowrap'>
                            Email
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Téléphone
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Adresse
                        </p>
                    </TableHead>
                    <TableHead>
                        <p className='text-sm font-medium text-nowrap'>
                            Ville
                        </p>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                  {data?.data.map((customer: ICustomer) => (
                    <TableRow key={customer.customer_id} className="hover:bg-gray-100 cursor-pointer">
                        <TableCell>
                           
                                {customer.type === 'company' ? 
                                <Building className="w-4 h-4" />
                            :
                                <User className="w-4 h-4" />
                            }
                          
                            
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                           {customer.type === 'company' ? customer.BusinessCustomer?.name : customer.IndividualCustomer?.first_name + ' ' + customer.IndividualCustomer?.last_name || "-"}
                            </p>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {customer.email || "-"}
                            </p>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {customer.phone || "-"}
                            </p>
                        </TableCell>
                        <TableCell>
                            <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {customer.address || "-"}
                            </div>
                        </TableCell>
                        <TableCell>
                            <p className='text-sm font-medium text-nowrap'>
                            {customer.city || "-"}
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