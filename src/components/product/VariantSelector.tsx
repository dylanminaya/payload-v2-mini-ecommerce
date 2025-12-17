'use client'

import { Button } from '@/components/ui/button'
import type { Product } from '@/payload-types'

import { createUrl } from '@/utilities/createUrl'
import clsx from 'clsx'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import React from 'react'

export function VariantSelector({ product }: { product: Product }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const variants = product.variants?.docs
  const variantTypes = product.variantTypes
  const hasVariants = Boolean(product.enableVariants && variants?.length && variantTypes?.length)

  if (!hasVariants) {
    return null
  }

  return variantTypes?.map((type) => {
    if (!type || typeof type !== 'object') {
      return null
    }

    // Get all option IDs that are actually used by this product's variants
    const usedOptionValues = new Set<string>()
    variants?.forEach((variant) => {
      if (typeof variant === 'object' && variant.options) {
        variant.options.forEach((opt) => {
          if (typeof opt === 'object' && opt.value) {
            usedOptionValues.add(opt.value)
          }
        })
      }
    })

    // Filter options to only show ones used by this product's variants
    const allOptions = type.options?.docs
    const options = allOptions?.filter((opt) => {
      if (typeof opt !== 'object') return false
      return usedOptionValues.has(opt.value)
    })

    if (!options || !Array.isArray(options) || !options.length) {
      return null
    }

    return (
      <dl className="" key={type.id}>
        <dt className="mb-4 text-sm">{type.label}</dt>
        <dd className="flex flex-wrap gap-3">
          <React.Fragment>
            {options?.map((option) => {
              if (!option || typeof option !== 'object') {
                return null
              }

              const optionID = option.id
              const optionKeyLowerCase = type.name

              // Base option params on current params so we can preserve any other param state in the url.
              const optionSearchParams = new URLSearchParams(searchParams.toString())

              // Remove image and variant ID from this search params so we can loop over it safely.
              optionSearchParams.delete('variant')
              optionSearchParams.delete('image')

              // Update the option params using the current option to reflect how the url *would* change,
              // if the option was clicked.
              optionSearchParams.set(optionKeyLowerCase, String(optionID))

              let isAvailableForSale = true

              // Find a matching variant by comparing option values instead of IDs
              // (handles case where variant options and displayed options are different records)
              if (variants) {
                const matchingVariant = variants
                  .filter((variant) => typeof variant === 'object')
                  .find((variant) => {
                    if (!variant.options || !Array.isArray(variant.options)) return false

                    // Check if any variant option matches the clicked option by value
                    return variant.options.some((variantOption) => {
                      if (typeof variantOption !== 'object') return false
                      // Match by value field instead of ID
                      return variantOption.value === option.value
                    })
                  })

                if (matchingVariant) {
                  // If we found a matching variant, set the variant ID in the search params.
                  optionSearchParams.set('variant', String(matchingVariant.id))

                  if (matchingVariant.inventory && matchingVariant.inventory > 0) {
                    isAvailableForSale = true
                  } else {
                    isAvailableForSale = false
                  }
                }
              }

              const optionUrl = createUrl(pathname, optionSearchParams)

              // The option is active if it's in the url params.
              const isActive =
                Boolean(isAvailableForSale) &&
                searchParams.get(optionKeyLowerCase) === String(optionID)

              return (
                <Button
                  variant={isActive ? 'default' : 'outline'}
                  aria-disabled={!isAvailableForSale}
                  className={clsx('px-4 py-2 transition-all', {
                    'bg-primary': isActive,
                    'bg-primary/10': !isAvailableForSale,
                  })}
                  disabled={!isAvailableForSale}
                  key={option.id}
                  onClick={() => {
                    router.replace(`${optionUrl}`, {
                      scroll: false,
                    })
                  }}
                  title={`${option.label} ${!isAvailableForSale ? ' (Out of Stock)' : ''}`}
                >
                  {option.label}
                </Button>
              )
            })}
          </React.Fragment>
        </dd>
      </dl>
    )
  })
}
