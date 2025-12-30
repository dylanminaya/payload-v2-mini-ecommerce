'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Copy } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

interface ESIMActivationData {
  smdpAddress?: string
  activationCode?: string
  lpaString?: string
  iccid?: string
}

interface ESIMActivationDetailsProps {
  activations: ESIMActivationData[]
  itemTitle?: string
  showIndexLabels?: boolean
}

export const ESIMActivationDetails: React.FC<ESIMActivationDetailsProps> = ({
  activations,
  itemTitle,
  showIndexLabels = true,
}) => {
  if (!activations || activations.length === 0) {
    return null
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  return (
    <div className="space-y-4">
      {itemTitle && (
        <h3 className="font-medium text-sm text-muted-foreground">
          {itemTitle}
        </h3>
      )}

      {activations.map((activation, index) => (
        <Card key={index} className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              {activations.length > 1 && showIndexLabels ? (
                <>eSIM Activation {index + 1} of {activations.length}</>
              ) : (
                <>eSIM Activation Details</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activation.smdpAddress && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">SM-DP+ Address</label>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                  <code className="flex-1 text-sm font-mono">{activation.smdpAddress}</code>
                  <button
                    onClick={() => handleCopy(activation.smdpAddress!, 'SM-DP+ Address')}
                    className="shrink-0 hover:bg-background p-1 rounded"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {activation.activationCode && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Activation Code</label>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">{activation.activationCode}</code>
                  <button
                    onClick={() => handleCopy(activation.activationCode!, 'Activation Code')}
                    className="shrink-0 hover:bg-background p-1 rounded"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}

            {activation.lpaString && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">
                  LPA String (Copy & Paste)
                </label>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                  <code className="flex-1 text-sm font-mono break-all">{activation.lpaString}</code>
                  <button
                    onClick={() => handleCopy(activation.lpaString!, 'LPA String')}
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

            {activation.iccid && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">ICCID</label>
                <div className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg">
                  <code className="flex-1 text-sm font-mono">{activation.iccid}</code>
                  <button
                    onClick={() => handleCopy(activation.iccid!, 'ICCID')}
                    className="shrink-0 hover:bg-background p-1 rounded"
                  >
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
