'use client'

import { Button } from '@/components/ui/button'
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
      <span>{t('cart.openCart')}</span>

      {quantity ? (
        <>
          <span>•</span>
          <span>{quantity}</span>
        </>
      ) : null}
    </Button>
  )
}
