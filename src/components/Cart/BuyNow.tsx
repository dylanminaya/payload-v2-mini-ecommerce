'use client'

import { Button } from '@/components/ui/button'
import type { Product, Variant } from '@/payload-types'

import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { useTranslations } from 'next-intl'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'

type Props = {
  product: Product
}

export function BuyNow({ product }: Props) {
  const t = useTranslations()
  const { addItem, isLoading } = useCart()
  const searchParams = useSearchParams()
  const router = useRouter()

  const selectedVariant = useMemo<Variant | undefined>(() => {
    const variants = product.variants?.docs || []
    if (product.enableVariants && variants.length) {
      const variantId = searchParams.get('variant')

      const validVariant = variants.find((variant) => {
        if (typeof variant === 'object') {
          return String(variant.id) === variantId
        }
        return String(variant) === variantId
      })

      if (validVariant && typeof validVariant === 'object') {
        return validVariant
      }
    }

    return undefined
  }, [product.enableVariants, product.variants?.docs, searchParams])

  const buyNow = useCallback(
    async (e: React.FormEvent<HTMLButtonElement>) => {
      e.preventDefault()

      await addItem({
        product: product.id,
        variant: selectedVariant?.id ?? undefined,
      })

      router.push('/checkout')
    },
    [addItem, product, selectedVariant, router],
  )

  const disabled = useMemo<boolean>(() => {
    if (product.enableVariants) {
      if (!selectedVariant) {
        return true
      }

      if (selectedVariant.inventory === 0) {
        return true
      }
    } else {
      if (product.inventory === 0) {
        return true
      }
    }

    return false
  }, [selectedVariant, product])

  return (
    <Button
      aria-label={t('product.buyNow')}
      variant="default"
      disabled={disabled || isLoading}
      onClick={buyNow}
      type="submit"
    >
      {t('product.buyNow')}
    </Button>
  )
}
