'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormItem } from '@/components/forms/FormItem'
import { CreditCard, Lock } from 'lucide-react'

interface FakePaymentFormProps {
  onSuccess: () => void
  onCancel?: () => void
  isProcessing?: boolean
  setIsProcessing?: (value: boolean) => void
  total: number
}

export const FakePaymentForm: React.FC<FakePaymentFormProps> = ({
  onSuccess,
  onCancel,
  isProcessing = false,
  setIsProcessing,
  total,
}) => {
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [cardholderName, setCardholderName] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required'
    }

    const cleanCardNumber = cardNumber.replace(/\s/g, '')
    if (!cleanCardNumber || cleanCardNumber.length < 16) {
      newErrors.cardNumber = 'Valid card number is required'
    }

    if (!expiryDate || expiryDate.length < 5) {
      newErrors.expiryDate = 'Valid expiry date is required'
    }

    if (!cvv || cvv.length < 3) {
      newErrors.cvv = 'Valid CVV is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsProcessing?.(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsProcessing?.(false)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Lock className="h-4 w-4" />
        <span>Secure payment (Demo mode)</span>
      </div>

      <FormItem>
        <Label htmlFor="cardholderName">Cardholder Name</Label>
        <Input
          id="cardholderName"
          placeholder="John Doe"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value)}
          disabled={isProcessing}
        />
        {errors.cardholderName && (
          <p className="text-destructive text-sm">{errors.cardholderName}</p>
        )}
      </FormItem>

      <FormItem>
        <Label htmlFor="cardNumber">Card Number</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength={19}
            disabled={isProcessing}
            className="pr-10"
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        {errors.cardNumber && (
          <p className="text-destructive text-sm">{errors.cardNumber}</p>
        )}
      </FormItem>

      <div className="grid grid-cols-2 gap-4">
        <FormItem>
          <Label htmlFor="expiryDate">Expiry Date</Label>
          <Input
            id="expiryDate"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
            maxLength={5}
            disabled={isProcessing}
          />
          {errors.expiryDate && (
            <p className="text-destructive text-sm">{errors.expiryDate}</p>
          )}
        </FormItem>

        <FormItem>
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            placeholder="123"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={4}
            disabled={isProcessing}
            type="password"
          />
          {errors.cvv && <p className="text-destructive text-sm">{errors.cvv}</p>}
        </FormItem>
      </div>

      <div className="border-t pt-4 mt-2">
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">Total</span>
          <span className="text-xl font-semibold">${total.toFixed(2)}</span>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : `Pay $${total.toFixed(2)}`}
        </Button>
      </div>

      {onCancel && (
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isProcessing}
          className="self-start"
        >
          Cancel
        </Button>
      )}

      <p className="text-xs text-muted-foreground text-center">
        This is a demo payment form. No real charges will be made.
      </p>
    </form>
  )
}
