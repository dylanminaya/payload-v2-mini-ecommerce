'use client'
import type { Country, Product, Variant } from '@/payload-types'

import { AddToCart } from '@/components/Cart/AddToCart'
import { BuyNow } from '@/components/Cart/BuyNow'
import { Price } from '@/components/Price'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

import { StockIndicator } from '@/components/product/StockIndicator'
import { useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import Image from 'next/image'
import { VariantSelector } from './VariantSelector'

export function ProductDescription({ product }: { product: Product }) {
  const { currency } = useCurrency()
  const searchParams = useSearchParams()
  const selectedVariantId = searchParams.get('variant')

  let amount = 0
  const priceField = `priceIn${currency.code}` as keyof Product
  const variantPriceField = `priceIn${currency.code}` as keyof Variant
  const hasVariants = product.enableVariants && Boolean(product.variants?.docs?.length)

  if (hasVariants) {
    const selectedVariant = selectedVariantId
      ? product.variants?.docs?.find(
        (variant) => typeof variant === 'object' && String(variant.id) === selectedVariantId
      )
      : null

    if (selectedVariant && typeof selectedVariant === 'object') {
      const variantPrice = selectedVariant[variantPriceField]
      if (typeof variantPrice === 'number') {
        amount = variantPrice
      }
    }
    // If no variant selected, amount stays 0
  } else if (product[priceField] && typeof product[priceField] === 'number') {
    amount = product[priceField]
  }

  // For local products, show country flag. For regional/global, show product icon
  const isLocal = product.esimType === 'local'
  const firstCountry = product.countries?.find((c): c is Country => typeof c === 'object')
  const iconUrl = product.iconUrl as string | undefined
  const displayIcon = isLocal ? firstCountry?.flagUrl : iconUrl
  const iconAlt = isLocal ? `${firstCountry?.name} flag` : product.title || 'Region icon'

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          {displayIcon && (
            <Image
              src={displayIcon}
              alt={iconAlt}
              className="h-10 w-auto object-contain"
              width={40}
              height={40}
            />
          )}
          <h1 className="text-2xl font-medium">{product.title}</h1>
        </div>

        <div className="space-y-4">
          {product.countries && product.countries.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Coverage
              </h3>
              <p className="mt-1">
                {product.countries
                  .filter((country): country is Country => typeof country === 'object')
                  .map((country) => country.name)
                  .join(', ')}
              </p>
            </div>
          )}

          {product.esimType && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Type
              </h3>
              <p className="mt-1 capitalize">{product.esimType}</p>
            </div>
          )}

          {product.coverage && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Network Coverage
              </h3>
              <p className="mt-1 whitespace-pre-line text-sm">{product.coverage}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 lg:border-l lg:pl-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Select Plan</h2>
          {amount > 0 && (
            <div className="uppercase font-mono text-xl">
              <Price amount={amount} />
            </div>
          )}
        </div>

        {hasVariants && (
          <Suspense fallback={null}>
            <VariantSelector product={product} />
          </Suspense>
        )}

        <Suspense fallback={null}>
          <StockIndicator product={product} />
        </Suspense>

        <div className="flex flex-col gap-3 mt-auto">
          <Suspense fallback={null}>
            <AddToCart product={product} />
          </Suspense>
          <Suspense fallback={null}>
            <BuyNow product={product} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
