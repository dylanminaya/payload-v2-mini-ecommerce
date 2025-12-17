'use client'

import React, { createContext, useCallback, useContext, useState } from 'react'

type CartUIContextType = {
  isCartOpen: boolean
  openCart: () => void
  closeCart: () => void
  setIsCartOpen: (open: boolean) => void
}

const CartUIContext = createContext<CartUIContextType | undefined>(undefined)

export const CartUIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isCartOpen, setIsCartOpen] = useState(false)

  const openCart = useCallback(() => setIsCartOpen(true), [])
  const closeCart = useCallback(() => setIsCartOpen(false), [])

  return (
    <CartUIContext.Provider value={{ isCartOpen, openCart, closeCart, setIsCartOpen }}>
      {children}
    </CartUIContext.Provider>
  )
}

export const useCartUI = () => {
  const context = useContext(CartUIContext)
  if (!context) {
    throw new Error('useCartUI must be used within a CartUIProvider')
  }
  return context
}
