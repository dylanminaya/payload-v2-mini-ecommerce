'use client'

import { Button } from '@/components/ui/button'
import { ShoppingCart } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function OpenCartButton({
  quantity,
  ...rest
}: {
  quantity?: number
}) {
  const t = useTranslations()

  return (
    <Button
      variant="nav"
      size="clear"
      className="navLink relative items-end hover:cursor-pointer"
      {...rest}
    >
      <div className="flex items-center gap-2">
        <ShoppingCart className="h-5 w-5" />
        <span className="hidden md:inline">{t('cart.openCart')}</span>
      </div>

      {quantity ? (
        <>
          <span className="hidden md:inline">•</span>
          <span>{quantity}</span>
        </>
      ) : null}
    </Button>
  )
}
