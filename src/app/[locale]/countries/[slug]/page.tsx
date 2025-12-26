import { Grid } from '@/components/Grid'
import { ProductGridItem } from '@/components/ProductGridItem'
import type { Locale } from '@/i18n'
import configPromise from '@payload-config'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

type Args = {
  params: Promise<{
    locale: Locale
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const payload = await getPayload({ config: configPromise })

  const country = await payload.find({
    collection: 'countries',
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  if (country.docs.length === 0) {
    return {
      title: 'Country Not Found',
    }
  }

  return {
    title: `eSIMs for ${country.docs[0].name}`,
    description: `Browse available eSIM plans for ${country.docs[0].name}`,
  }
}

export default async function CountryPage({ params }: Args) {
  const { slug, locale } = await params
  const t = await getTranslations()
  const payload = await getPayload({ config: configPromise })

  // Find the country by slug
  const countryResult = await payload.find({
    collection: 'countries',
    locale,
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  if (countryResult.docs.length === 0) {
    notFound()
  }

  const country = countryResult.docs[0]

  // Find all products that have this country in their countries relationship
  const products = await payload.find({
    collection: 'products',
    draft: false,
    locale,
    overrideAccess: false,
    where: {
      and: [
        {
          _status: {
            equals: 'published',
          },
        },
        {
          countries: {
            contains: country.id,
          },
        },
      ],
    },
    select: {
      title: true,
      slug: true,
      gallery: true,
      priceInUSD: true,
      iconUrl: true,
    },
    sort: 'title',
  })

  const resultsText = products.docs.length > 1 ? 'eSIMs' : 'eSIM'

  return (
    <div className="container my-16">
      <Link
        href={`/${locale}`}
        className="text-sm text-muted-foreground hover:text-primary mb-4 inline-block"
      >
        &larr; {t('common.backToCountries')}
      </Link>

      <div className="flex items-center gap-4 mb-8">
        {country.flagUrl && (
          <Image
            src={country.flagUrl}
            alt={`${country.name} flag`}
            className="h-16 w-auto object-contain"
            width={64}
            height={64}
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{country.name}</h1>
          <p className="text-muted-foreground">
            {products.docs.length} {resultsText} available
          </p>
        </div>
      </div>

      {products.docs?.length === 0 && (
        <p className="text-muted-foreground">
          No eSIM plans are currently available for {country.name}.
        </p>
      )}

      {products?.docs.length > 0 ? (
        <Grid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.docs.map((product) => {
            return <ProductGridItem key={product.id} locale={locale} product={product} />
          })}
        </Grid>
      ) : null}
    </div>
  )
}
