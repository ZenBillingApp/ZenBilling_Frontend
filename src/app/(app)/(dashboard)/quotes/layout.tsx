import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Devis - ZenBilling',
  description: 'Gérez vos devis avec ZenBilling',
}

export default function QuotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      {children}
    </div>
  )
} 