import { Grid } from '@/components/Grid'
import { CountrySearch } from '@/components/CountrySearch'
import { Tabs } from '@/components/ui/tabs'
import type { Country, Product } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import Image from 'next/image'
import Link from 'next/link'
import React, { Suspense } from 'react'

export const metadata = {
  description: 'Browse eSIMs by country - Find the perfect data plan for your travels',
  title: 'eSIM Store - Browse by Country',
}

type SearchParams = { [key: string]: string | string[] | undefined }

type Props = {
  searchParams: Promise<SearchParams>
}

const tabs = [
  { label: 'Local', value: 'local' },
  { label: 'Regional', value: 'regional' },
  { label: 'Global', value: 'global' },
]

const tabDescriptions: Record<string, string> = {
  local: 'eSIM plans for a single country',
  regional: 'eSIM plans that cover multiple countries in a region',
  global: 'eSIM plans with worldwide coverage',
}

export default async function HomePage({ searchParams }: Props) {
  const { q: searchValue, tab = 'local' } = await searchParams
  const currentTab = Array.isArray(tab) ? tab[0] : tab
  const payload = await getPayload({ config: configPromise })

  // Query products filtered by esimType
  const products = await payload.find({
    collection: 'products',
    limit: 1000,
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          esimType: {
            equals: currentTab,
          },
        },
      ],
    },
    depth: 1, // Populate countries
  })

  // For LOCAL: Extract unique countries from the products and map to their product
  // For REGIONAL/GLOBAL: Show the products themselves (regions/global plans)
  const isLocal = currentTab === 'local'

  let localCountries: Array<{ country: Country; productSlug: string }> = []
  let regionalProducts: Product[] = []

  if (isLocal) {
    // Extract unique countries and map each to its product
    const countriesMap = new Map<string, { country: Country; productSlug: string }>()
    products.docs.forEach((product) => {
      product.countries?.forEach((country) => {
        if (typeof country === 'object' && country.id && !countriesMap.has(country.id)) {
          countriesMap.set(country.id, {
            country,
            productSlug: product.slug || '',
          })
        }
      })
    })

    // Convert to array and sort by name
    localCountries = Array.from(countriesMap.values()).sort((a, b) =>
      (a.country.name || '').localeCompare(b.country.name || '')
    )

    // Apply search filter if provided
    if (searchValue) {
      const searchLower = String(searchValue).toLowerCase()
      localCountries = localCountries.filter((item) =>
        item.country.name?.toLowerCase().includes(searchLower)
      )
    }
  } else {
    // For regional/global, show the products themselves
    regionalProducts = products.docs.sort((a, b) =>
      (a.title || '').localeCompare(b.title || '')
    )

    // Apply search filter if provided
    if (searchValue) {
      const searchLower = String(searchValue).toLowerCase()
      regionalProducts = regionalProducts.filter((product) =>
        product.title?.toLowerCase().includes(searchLower)
      )
    }
  }

  const itemCount = isLocal ? localCountries.length : regionalProducts.length
  const resultsText = itemCount > 1 ? 'results' : 'result'

  return (
    <div className="container my-16">
      <h1 className="text-3xl font-bold mb-4">Browse eSIMs</h1>

      <Suspense fallback={null}>
        <Tabs tabs={tabs} paramName="tab" defaultValue="local" className="mb-8" />
      </Suspense>

      <Suspense fallback={null}>
        <CountrySearch className="mb-8" />
      </Suspense>

      {searchValue ? (
        <p className="mb-4">
          {itemCount === 0
            ? 'There are no results that match '
            : `Showing ${itemCount} ${resultsText} for `}
          <span className="font-bold">&quot;{searchValue}&quot;</span>
        </p>
      ) : (
        <p className="mb-8 text-muted-foreground">
          {tabDescriptions[currentTab] || 'Select an option to see available eSIM plans'}
        </p>
      )}

      {itemCount === 0 && !searchValue && (
        <p className="text-muted-foreground">No {currentTab} plans available yet.</p>
      )}

      {isLocal && localCountries.length > 0 && (
        <Grid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {localCountries.map(({ country, productSlug }) => (
            <Link
              key={country.id}
              href={`/products/${productSlug}`}
              className="relative inline-block h-full w-full group"
            >
              <div className="relative aspect-square border rounded-2xl p-8 bg-primary-foreground flex items-center justify-center overflow-hidden">
                {country.flagUrl ? (
                  <Image
                    src={country.flagUrl}
                    alt={`${country.name} flag`}
                    className="h-full w-full object-contain transition duration-300 ease-in-out group-hover:scale-105"
                    width={128}
                    height={128}
                  />
                ) : (
                  <div className="text-6xl">🌍</div>
                )}
              </div>
              <div className="font-mono flex justify-center items-center mt-4 text-primary/50 group-hover:text-primary">
                <div className="text-center">{country.name}</div>
              </div>
            </Link>
          ))}
        </Grid>
      )}

      {!isLocal && regionalProducts.length > 0 && (
        <Grid className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {regionalProducts.map((product) => {
            const iconUrl = product.iconUrl as string | undefined

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="relative inline-block h-full w-full group"
              >
                <div className="relative aspect-square border rounded-2xl p-8 bg-primary-foreground flex items-center justify-center overflow-hidden">
                  {iconUrl ? (
                    <Image
                      src={iconUrl}
                      alt={product.title || ''}
                      className="h-full w-full object-contain transition duration-300 ease-in-out group-hover:scale-105"
                      width={128}
                      height={128}
                    />
                  ) : (
                    <div className="text-6xl">
                      {currentTab === 'regional' ? '🌍' : '🌐'}
                    </div>
                  )}
                </div>
                <div className="font-mono flex justify-center items-center mt-4 text-primary/50 group-hover:text-primary">
                  <div className="text-center">{product.title}</div>
                </div>
              </Link>
            )
          })}
        </Grid>
      )}
    </div>
  )
}
