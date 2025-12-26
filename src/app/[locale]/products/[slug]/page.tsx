import type { Media, Product } from '@/payload-types'

import { RenderBlocks } from '@/blocks/RenderBlocks'
import { GridTileImage } from '@/components/Grid/tile'
import { ProductDescription } from '@/components/product/ProductDescription'
import { Button } from '@/components/ui/button'
import configPromise from '@payload-config'
import { ChevronLeftIcon } from 'lucide-react'
import { Metadata } from 'next'
import { draftMode } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

type Args = {
  params: Promise<{
    locale: string
    slug: string
  }>
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug, locale } = await params
  const product = await queryProductBySlug({ slug, locale })

  if (!product) return notFound()

  const gallery = product.gallery?.filter((item) => typeof item.image === 'object') || []

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const canIndex = product._status === 'published'

  const seoImage = metaImage || (gallery.length ? (gallery[0]?.image as Media) : undefined)

  return {
    description: product.meta?.description || '',
    openGraph: seoImage?.url
      ? {
        images: [
          {
            alt: seoImage?.alt,
            height: seoImage.height!,
            url: seoImage?.url,
            width: seoImage.width!,
          },
        ],
      }
      : null,
    robots: {
      follow: canIndex,
      googleBot: {
        follow: canIndex,
        index: canIndex,
      },
      index: canIndex,
    },
    title: product.meta?.title || product.title,
  }
}

export default async function ProductPage({ params }: Args) {
  const { slug, locale } = await params
  const t = await getTranslations()
  const product = await queryProductBySlug({ slug, locale })

  if (!product) return notFound()

  const metaImage = typeof product.meta?.image === 'object' ? product.meta?.image : undefined
  const hasStock = product.enableVariants
    ? product?.variants?.docs?.some((variant) => {
      if (typeof variant !== 'object') return false
      return variant.inventory && variant?.inventory > 0
    })
    : product.inventory! > 0

  let price = product.priceInUSD

  if (product.enableVariants && product?.variants?.docs?.length) {
    price = product?.variants?.docs?.reduce((acc, variant) => {
      if (typeof variant === 'object' && variant?.priceInUSD && acc && variant?.priceInUSD > acc) {
        return variant.priceInUSD
      }
      return acc
    }, price)
  }

  const productJsonLd = {
    name: product.title,
    '@context': 'https://schema.org',
    '@type': 'Product',
    description: product.description,
    image: metaImage?.url,
    offers: {
      '@type': 'AggregateOffer',
      availability: hasStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      price: price,
      priceCurrency: 'usd',
    },
  }

  const relatedProducts =
    product.relatedProducts?.filter((relatedProduct) => typeof relatedProduct === 'object') ?? []

  // Determine back navigation based on esimType
  const esimType = product.esimType as string | undefined
  let backLink = `/${locale}`
  let backLabel = t('product.allEsims')

  if (esimType === 'local') {
    backLink = `/${locale}/?tab=local`
    backLabel = t('product.localEsims')
  } else if (esimType === 'regional') {
    backLink = `/${locale}/?tab=regional`
    backLabel = t('product.regionalEsims')
  } else if (esimType === 'global') {
    backLink = `/${locale}/?tab=global`
    backLabel = t('product.globalEsims')
  }

  return (
    <React.Fragment>
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
        type="application/ld+json"
      />
      <div className="container pt-8 pb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={backLink}>
            <ChevronLeftIcon />
            {backLabel}
          </Link>
        </Button>
        <div className="rounded-lg border p-8 md:py-12 bg-primary-foreground">
          <ProductDescription product={product} />
        </div>
      </div>

      {product.layout?.length ? <RenderBlocks blocks={product.layout} /> : <></>}

      {relatedProducts.length ? (
        <div className="container">
          <RelatedProducts locale={locale} products={relatedProducts as Product[]} />
        </div>
      ) : (
        <></>
      )}
    </React.Fragment>
  )
}

async function RelatedProducts({ locale, products }: { locale: string; products: Product[] }) {
  if (!products.length) return null

  const t = await getTranslations()

  return (
    <div className="py-8">
      <h2 className="mb-4 text-2xl font-bold">{t('product.relatedProducts')}</h2>
      <ul className="flex w-full gap-4 overflow-x-auto pt-1">
        {products.map((product) => (
          <li
            className="aspect-square w-full flex-none min-[475px]:w-1/2 sm:w-1/3 md:w-1/4 lg:w-1/5"
            key={product.id}
          >
            <Link className="relative h-full w-full" href={`/${locale}/products/${product.slug}`}>
              <GridTileImage
                label={{
                  amount: product.priceInUSD!,
                  title: product.title,
                }}
                media={product.meta?.image as Media}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

const queryProductBySlug = async ({ slug, locale }: { slug: string; locale: string }) => {
  const { isEnabled: draft } = await draftMode()

  const payload = await getPayload({ config: configPromise })

  const result = await payload.find({
    collection: 'products',
    depth: 3,
    draft,
    limit: 1,
    locale,
    overrideAccess: draft,
    pagination: false,
    where: {
      and: [
        {
          slug: {
            equals: slug,
          },
        },
        ...(draft ? [] : [{ _status: { equals: 'published' } }]),
      ],
    },
    populate: {
      variants: {
        title: true,
        priceInUSD: true,
        inventory: true,
        options: true,
      },
      countries: {
        name: true,
        slug: true,
        flagUrl: true,
      },
    },
  })

  return result.docs?.[0] || null
}
