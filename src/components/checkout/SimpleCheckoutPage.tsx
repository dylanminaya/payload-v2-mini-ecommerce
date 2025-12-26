'use client'

import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

import { createOrder } from '@/app/[locale]/checkout/actions'
import { OrderConfirmation } from '@/components/checkout/OrderConfirmation'
import { FakePaymentForm } from '@/components/forms/FakePaymentForm'
import { FormItem } from '@/components/forms/FormItem'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Media } from '@/components/Media'
import { Price } from '@/components/Price'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Country } from '@/payload-types'

type CheckoutStep = 'contact' | 'payment' | 'confirmation'

export const SimpleCheckoutPage: React.FC = () => {
  const t = useTranslations()
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const [step, setStep] = useState<CheckoutStep>('contact')
  const [email, setEmail] = useState('')
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderItems, setOrderItems] = useState<any[]>([])
  const [orderId, setOrderId] = useState<string | null>(null)

  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const canProceedToPayment = Boolean(user || (email && emailConfirmed))

  const handlePaymentSuccess = async () => {
    try {
      // Prepare order items for database
      const orderItemsForDB = cart?.items
        ?.map((item) => {
          if (typeof item.product === 'object' && item.product) {
            return {
              product: item.product.id,
              variant: typeof item.variant === 'object' ? item.variant?.id || null : item.variant || null,
              quantity: item.quantity || 1,
            }
          }
          return null
        })
        .filter((item): item is { product: string; variant: string | null; quantity: number } => item !== null) || []

      // Store order items for display before clearing cart
      const displayItems = cart?.items?.map((item) => {
        if (typeof item.product === 'object' && item.product) {
          const product = item.product
          const isLocal = product.esimType === 'local'
          const firstCountry = product.countries?.find(
            (c): c is Country => typeof c === 'object'
          )
          return {
            title: product.title,
            provider: product.provider,
            region: isLocal ? firstCountry?.name : product.title,
            iconUrl: isLocal ? firstCountry?.flagUrl : product.iconUrl,
            esimType: product.esimType,
            networkType: product.networkType,
            variant: item.variant,
          }
        }
        return null
      }).filter(Boolean) || []

      // Create the order in the database
      // Note: cart.subtotal is in dollars, but order.amount expects cents
      const result = await createOrder({
        items: orderItemsForDB,
        customer: user?.id || null,
        customerEmail: user?.email || email,
        amount: Math.round((cart?.subtotal || 0) * 100),
        currency: 'USD',
      })

      if (result.success && result.orderId) {
        setOrderId(result.orderId)
        setOrderItems(displayItems)

        // Clear the cart
        await clearCart()

        // Move to confirmation step
        setStep('confirmation')
      } else {
        console.error('Failed to create order:', result.error)
        alert('Failed to create order. Please try again.')
      }
    } catch (error) {
      console.error('Error in handlePaymentSuccess:', error)
      alert('An error occurred while processing your order. Please try again.')
    }
  }

  // Show confirmation page
  if (step === 'confirmation') {
    return (
      <div className="container">
        <OrderConfirmation orderItems={orderItems} orderId={orderId} />
      </div>
    )
  }

  // Show processing state
  if (cartIsEmpty && isProcessing) {
    return (
      <div className="py-12 w-full flex flex-col items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>{t('checkout.processing')}</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  // Show empty cart
  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>{t('cart.empty')}</p>
        <Link href="/">{t('common.continueShopping')}</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      {/* Left Column - Form */}
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        {/* Contact Section */}
        <h2 className="font-medium text-3xl">{t('checkout.contact')}</h2>
        {!user && (
          <div className="bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit" variant="outline">
                <Link href="/login">{t('checkout.login')}</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">{t('common.or')}</span>
                <Link href="/create-account">{t('checkout.createAccount')}</Link>
              </p>
            </div>
          </div>
        )}

        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4">
            <p>{user.email}</p>
            <p>
              {t('checkout.notYou')}{' '}
              <Link className="underline" href="/logout">
                {t('checkout.logout')}
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4">
            <p className="mb-4">{t('checkout.guestCheckout')}</p>

            <FormItem className="mb-6">
              <Label htmlFor="email">{t('checkout.emailLabel')}</Label>
              <Input
                disabled={emailConfirmed}
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                value={email}
              />
            </FormItem>

            {!emailConfirmed ? (
              <Button
                disabled={!email}
                onClick={() => setEmailConfirmed(true)}
                variant="default"
              >
                {t('checkout.continueAsGuest')}
              </Button>
            ) : (
              <Button
                onClick={() => setEmailConfirmed(false)}
                variant="outline"
              >
                {t('checkout.editEmail')}
              </Button>
            )}
          </div>
        )}

        {/* Payment Section */}
        {canProceedToPayment && (
          <>
            <h2 className="font-medium text-3xl">{t('checkout.payment')}</h2>
            <div className="bg-accent dark:bg-card rounded-lg p-6">
              <FakePaymentForm
                total={cart?.subtotal || 0}
                onSuccess={handlePaymentSuccess}
                isProcessing={isProcessing}
                setIsProcessing={setIsProcessing}
              />
            </div>
          </>
        )}
      </div>

      {/* Right Column - Cart Summary */}
      <div className="basis-full lg:basis-1/3 lg:pl-8 p-8 border-none bg-primary/5 flex flex-col gap-8 rounded-lg">
        <h2 className="text-3xl font-medium">{t('checkout.yourCart')}</h2>
        {cart?.items?.map((item, index) => {
          if (typeof item.product === 'object' && item.product) {
            const {
              product,
              product: { meta, title, gallery },
              quantity,
              variant,
            } = item

            if (!quantity) return null

            let image = gallery?.[0]?.image || meta?.image
            let price = product?.priceInUSD

            const isVariant = Boolean(variant) && typeof variant === 'object'
            const isLocal = product.esimType === 'local'
            const firstCountry = product.countries?.find(
              (c): c is Country => typeof c === 'object'
            )
            const productIcon = product.iconUrl as string | undefined
            const displayIcon = isLocal ? firstCountry?.flagUrl : productIcon
            const iconAlt = isLocal
              ? `${firstCountry?.name} flag`
              : product.title || 'Region icon'

            if (isVariant) {
              price = variant?.priceInUSD

              const imageVariant = product.gallery?.find((item) => {
                if (!item.variantOption) return false
                const variantOptionID =
                  typeof item.variantOption === 'object'
                    ? item.variantOption.id
                    : item.variantOption

                const hasMatch = variant?.options?.some((option) => {
                  if (typeof option === 'object') return option.id === variantOptionID
                  else return option === variantOptionID
                })

                return hasMatch
              })

              if (imageVariant && typeof imageVariant.image !== 'string') {
                image = imageVariant.image
              }
            }

            return (
              <div className="flex items-start gap-4" key={index}>
                <div className="relative flex items-stretch justify-stretch h-20 w-20 p-2 rounded-lg border">
                  <div className="relative w-full h-full">
                    {image && typeof image !== 'string' && (
                      <Media className="" fill imgClassName="rounded-lg" resource={image} />
                    )}
                  </div>
                  {displayIcon && (
                    <Image
                      src={displayIcon}
                      alt={iconAlt}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-auto object-contain rounded-sm shadow-sm"
                      width={32}
                      height={32}
                    />
                  )}
                </div>
                <div className="flex grow justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <p className="font-medium text-lg">{title}</p>
                    {variant && typeof variant === 'object' && (
                      <p className="text-sm font-mono text-primary/50 tracking-widest">
                        {variant.options
                          ?.map((option) => {
                            if (typeof option === 'object') return option.label
                            return null
                          })
                          .join(', ')}
                      </p>
                    )}
                    <div>
                      {t('cart.quantity')}
                      {quantity}
                    </div>
                  </div>

                  {typeof price === 'number' && <Price amount={price} />}
                </div>
              </div>
            )
          }
          return null
        })}
        <hr />
        <div className="flex justify-between items-center gap-2">
          <span className="uppercase">{t('common.total')}</span>
          <Price className="text-3xl font-medium" amount={cart.subtotal || 0} />
        </div>
      </div>
    </div>
  )
}
