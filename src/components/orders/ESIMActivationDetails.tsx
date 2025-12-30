'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

interface ESIMActivationDetailsProps {
  smdpAddress?: string
  activationCode?: string
  lpaString?: string
  iccid?: string
}

export const ESIMActivationDetails: React.FC<ESIMActivationDetailsProps> = ({
  smdpAddress,
  activationCode,
  lpaString,
  iccid,
}) => {
  if (!smdpAddress && !activationCode && !lpaString && !iccid) {
    return null
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          eSIM Activation Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {smdpAddress && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">SM-DP+ Address</label>
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <code className="flex-1 text-sm font-mono">{smdpAddress}</code>
              <button
                onClick={() => handleCopy(smdpAddress, 'SM-DP+ Address')}
                className="shrink-0 hover:bg-background p-1 rounded"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {activationCode && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Activation Code</label>
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">{activationCode}</code>
              <button
                onClick={() => handleCopy(activationCode, 'Activation Code')}
                className="shrink-0 hover:bg-background p-1 rounded"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}

        {lpaString && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              LPA String (Copy & Paste)
            </label>
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <code className="flex-1 text-sm font-mono break-all">{lpaString}</code>
              <button
                onClick={() => handleCopy(lpaString, 'LPA String')}
                className="shrink-0 hover:bg-background p-1 rounded"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this string to manually activate your eSIM if QR code scanning is not available
            </p>
          </div>
        )}

        {iccid && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">ICCID</label>
            <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
              <code className="flex-1 text-sm font-mono">{iccid}</code>
              <button
                onClick={() => handleCopy(iccid, 'ICCID')}
                className="shrink-0 hover:bg-background p-1 rounded"
              >
                <Copy className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
