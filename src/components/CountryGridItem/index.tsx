import type { Country } from '@/payload-types'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

type Props = {
  country: Partial<Country>
  hasProducts?: boolean
}

export const CountryGridItem: React.FC<Props> = ({ country, hasProducts = true }) => {
  const { name, slug, flagUrl } = country

  const content = (
    <>
      <div className={`relative aspect-square border rounded-2xl p-8 bg-primary-foreground flex items-center justify-center overflow-hidden ${!hasProducts ? 'opacity-40' : ''}`}>
        {flagUrl ? (
          <Image
            src={flagUrl}
            alt={`${name} flag`}
            className={`h-full w-full object-contain transition duration-300 ease-in-out ${hasProducts ? 'group-hover:scale-105' : ''}`}
            width={128}
            height={128}
          />
        ) : (
          <div className="text-6xl">🌍</div>
        )}
      </div>

      <div className={`font-mono flex justify-center items-center mt-4 ${hasProducts ? 'text-primary/50 group-hover:text-primary' : 'text-primary/30'}`}>
        <div className="text-center">{name}</div>
        {!hasProducts && <span className="ml-2 text-xs">(No plans)</span>}
      </div>
    </>
  )

  if (!hasProducts) {
    return (
      <div className="relative inline-block h-full w-full cursor-not-allowed">
        {content}
      </div>
    )
  }

  return (
    <Link
      className="relative inline-block h-full w-full group"
      href={`/countries/${slug}`}
    >
      {content}
    </Link>
  )
}
