'use client'

import { useAuth } from '@/providers/Auth'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import Link from 'next/link'
import React, { useState } from 'react'

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
  const { user } = useAuth()
  const { cart, clearCart } = useCart()
  const [step, setStep] = useState<CheckoutStep>('contact')
  const [email, setEmail] = useState('')
  const [emailConfirmed, setEmailConfirmed] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderItems, setOrderItems] = useState<any[]>([])

  const cartIsEmpty = !cart || !cart.items || !cart.items.length
  const canProceedToPayment = Boolean(user || (email && emailConfirmed))

  const handlePaymentSuccess = async () => {
    // Store order items before clearing cart
    const items = cart?.items?.map((item) => {
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

    setOrderItems(items)

    // Clear the cart
    await clearCart()

    // Move to confirmation step
    setStep('confirmation')
  }

  // Show confirmation page
  if (step === 'confirmation') {
    return (
      <div className="container">
        <OrderConfirmation orderItems={orderItems} />
      </div>
    )
  }

  // Show processing state
  if (cartIsEmpty && isProcessing) {
    return (
      <div className="py-12 w-full flex flex-col items-center justify-center">
        <div className="prose dark:prose-invert text-center max-w-none self-center mb-8">
          <p>Processing your payment...</p>
        </div>
        <LoadingSpinner />
      </div>
    )
  }

  // Show empty cart
  if (cartIsEmpty) {
    return (
      <div className="prose dark:prose-invert py-12 w-full items-center">
        <p>Your cart is empty.</p>
        <Link href="/">Continue shopping?</Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-stretch justify-stretch my-8 md:flex-row grow gap-10 md:gap-6 lg:gap-8">
      {/* Left Column - Form */}
      <div className="basis-full lg:basis-2/3 flex flex-col gap-8 justify-stretch">
        {/* Contact Section */}
        <h2 className="font-medium text-3xl">Contact</h2>
        {!user && (
          <div className="bg-accent dark:bg-black rounded-lg p-4 w-full flex items-center">
            <div className="prose dark:prose-invert">
              <Button asChild className="no-underline text-inherit" variant="outline">
                <Link href="/login">Log in</Link>
              </Button>
              <p className="mt-0">
                <span className="mx-2">or</span>
                <Link href="/create-account">create an account</Link>
              </p>
            </div>
          </div>
        )}

        {user ? (
          <div className="bg-accent dark:bg-card rounded-lg p-4">
            <p>{user.email}</p>
            <p>
              Not you?{' '}
              <Link className="underline" href="/logout">
                Log out
              </Link>
            </p>
          </div>
        ) : (
          <div className="bg-accent dark:bg-black rounded-lg p-4">
            <p className="mb-4">Enter your email to checkout as a guest.</p>

            <FormItem className="mb-6">
              <Label htmlFor="email">Email Address</Label>
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
                Continue as guest
              </Button>
            ) : (
              <Button
                onClick={() => setEmailConfirmed(false)}
                variant="outline"
              >
                Edit email
              </Button>
            )}
          </div>
        )}

        {/* Payment Section */}
        {canProceedToPayment && (
          <>
            <h2 className="font-medium text-3xl">Payment</h2>
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
        <h2 className="text-3xl font-medium">Your cart</h2>
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
                      {'x'}
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
          <span className="uppercase">Total</span>
          <Price className="text-3xl font-medium" amount={cart.subtotal || 0} />
        </div>
      </div>
    </div>
  )
}
