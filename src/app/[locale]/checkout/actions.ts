'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

export interface CreateOrderInput {
  items: {
    product: string
    variant?: string | null
    quantity: number
  }[]
  customer?: string | null
  customerEmail?: string
  amount: number
  currency?: 'USD'
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const payload = await getPayload({ config })

    const order = await payload.create({
      collection: 'orders',
      data: {
        items: input.items,
        customer: input.customer || null,
        customerEmail: input.customerEmail,
        amount: input.amount,
        currency: input.currency || 'USD',
        status: 'processing',
      },
    })

    return { success: true, orderId: order.id }
  } catch (error) {
    console.error('Error creating order:', error)
    return { success: false, error: 'Failed to create order' }
  }
}
