import type { Metadata } from 'next'

import { ConfirmOrder } from '@/components/checkout/ConfirmOrder'
import { mergeOpenGraph } from '@/utilities/mergeOpenGraph'

export default async function ConfirmOrderPage() {

  return (
    <div className="container min-h-[90vh] flex py-12">
      <ConfirmOrder />
    </div>
  )
}

export const metadata: Metadata = {
  description: 'Confirm order.',
  openGraph: mergeOpenGraph({
    title: 'Confirming order',
    url: '/checkout/confirm-order',
  }),
  title: 'Confirming order',
}
