'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2,
  Copy,
  Download,
  HelpCircle,
  Mail,
  Sun,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import React from 'react'
import { toast } from 'sonner'

interface OrderItem {
  title: string
  provider?: string
  region?: string
  dataPlan?: string
  validity?: string
  iconUrl?: string
  esimType?: 'local' | 'regional' | 'global'
  networkType?: '5G' | 'LTE' | '4G' | '3G'
  variant?: {
    options?: Array<{ label?: string } | string>
  }
}

interface OrderConfirmationProps {
  orderItems: OrderItem[]
  orderNumber?: string
  orderId?: string | null
}

// Placeholder QR Code component
const PlaceholderQRCode: React.FC = () => {
  const t = useTranslations()

  return (
    <div className="relative bg-[#c5d4b8] p-4 rounded-lg">
      <div className="w-48 h-48 bg-white rounded-lg flex items-center justify-center p-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* QR Code pattern simulation */}
          <rect x="5" y="5" width="25" height="25" fill="#1a1a1a" />
          <rect x="10" y="10" width="15" height="15" fill="white" />
          <rect x="13" y="13" width="9" height="9" fill="#1a1a1a" />

          <rect x="70" y="5" width="25" height="25" fill="#1a1a1a" />
          <rect x="75" y="10" width="15" height="15" fill="white" />
          <rect x="78" y="13" width="9" height="9" fill="#1a1a1a" />

          <rect x="5" y="70" width="25" height="25" fill="#1a1a1a" />
          <rect x="10" y="75" width="15" height="15" fill="white" />
          <rect x="13" y="78" width="9" height="9" fill="#1a1a1a" />

          {/* Random pattern */}
          <rect x="35" y="5" width="5" height="5" fill="#1a1a1a" />
          <rect x="45" y="5" width="5" height="5" fill="#1a1a1a" />
          <rect x="55" y="5" width="5" height="5" fill="#1a1a1a" />
          <rect x="35" y="15" width="5" height="5" fill="#1a1a1a" />
          <rect x="50" y="15" width="5" height="5" fill="#1a1a1a" />
          <rect x="60" y="15" width="5" height="5" fill="#1a1a1a" />

          <rect x="5" y="35" width="5" height="5" fill="#1a1a1a" />
          <rect x="15" y="40" width="5" height="5" fill="#1a1a1a" />
          <rect x="25" y="35" width="5" height="5" fill="#1a1a1a" />
          <rect x="5" y="50" width="5" height="5" fill="#1a1a1a" />
          <rect x="20" y="55" width="5" height="5" fill="#1a1a1a" />
          <rect x="5" y="60" width="5" height="5" fill="#1a1a1a" />

          <rect x="35" y="35" width="5" height="5" fill="#1a1a1a" />
          <rect x="45" y="40" width="5" height="5" fill="#1a1a1a" />
          <rect x="55" y="35" width="5" height="5" fill="#1a1a1a" />
          <rect x="40" y="50" width="5" height="5" fill="#1a1a1a" />
          <rect x="50" y="55" width="5" height="5" fill="#1a1a1a" />
          <rect x="60" y="45" width="5" height="5" fill="#1a1a1a" />

          <rect x="70" y="35" width="5" height="5" fill="#1a1a1a" />
          <rect x="80" y="40" width="5" height="5" fill="#1a1a1a" />
          <rect x="90" y="35" width="5" height="5" fill="#1a1a1a" />
          <rect x="75" y="50" width="5" height="5" fill="#1a1a1a" />
          <rect x="85" y="55" width="5" height="5" fill="#1a1a1a" />
          <rect x="90" y="60" width="5" height="5" fill="#1a1a1a" />

          <rect x="35" y="70" width="5" height="5" fill="#1a1a1a" />
          <rect x="45" y="75" width="5" height="5" fill="#1a1a1a" />
          <rect x="55" y="80" width="5" height="5" fill="#1a1a1a" />
          <rect x="40" y="85" width="5" height="5" fill="#1a1a1a" />
          <rect x="60" y="90" width="5" height="5" fill="#1a1a1a" />

          <rect x="70" y="70" width="5" height="5" fill="#1a1a1a" />
          <rect x="80" y="75" width="5" height="5" fill="#1a1a1a" />
          <rect x="90" y="80" width="5" height="5" fill="#1a1a1a" />
          <rect x="75" y="90" width="5" height="5" fill="#1a1a1a" />
          <rect x="85" y="85" width="5" height="5" fill="#1a1a1a" />
        </svg>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-white px-2 py-0.5 text-[10px] text-gray-500 rounded">
          {t('orderConfirmation.activateEsim')}
        </div>
      </div>
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
        <span className="inline-flex items-center gap-1 bg-white/90 text-green-700 text-xs px-2 py-1 rounded-full">
          <CheckCircle2 className="h-3 w-3" />
          {t('orderConfirmation.validFor')}
        </span>
      </div>
    </div>
  )
}

export const OrderConfirmation: React.FC<OrderConfirmationProps> = ({
  orderItems,
  orderId,
}) => {
  const t = useTranslations()

  // Generate a fake ICCID
  const generateICCID = () => {
    const base = '8934 0400'
    const hidden = '**** ****'
    const last = Math.floor(1000 + Math.random() * 9000).toString()
    return `${base} ${hidden} ${last}`
  }

  const iccid = React.useMemo(() => generateICCID(), [])

  const handleCopyICCID = () => {
    navigator.clipboard.writeText(iccid.replace(/\s/g, ''))
    toast.success(t('orderConfirmation.iccidCopied'))
  }

  const handleSendToEmail = () => {
    toast.success(t('orderConfirmation.detailsSent'))
  }

  const handleDownloadQR = () => {
    toast.success(t('orderConfirmation.qrDownloaded'))
  }

  // Get first item for display (typically eSIM orders have one item)
  const firstItem = orderItems[0]

  // Extract variant info for data plan and validity
  const variantLabels = firstItem?.variant?.options
    ?.map((opt) => (typeof opt === 'object' ? opt.label : opt))
    .filter(Boolean) || []

  // Parse variant labels to extract data plan and validity
  const dataPlan = variantLabels.find((label) => label?.includes('GB')) || '10 GB'
  const validity = variantLabels.find((label) => label?.includes('Day')) || '30 Days'

  return (
    <div className="min-h-[80vh] py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <h1 className="text-3xl md:text-4xl font-semibold">
              {t('orderConfirmation.title')}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {t('orderConfirmation.your')}{' '}
            <span className="font-medium text-foreground">{firstItem?.title}</span>{' '}
            {t('orderConfirmation.isReady')}
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground mt-2">
              Order ID:{' '}
              <Link
                href={`/orders/${orderId}`}
                className="font-mono font-medium text-foreground hover:underline"
              >
                {orderId}
              </Link>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6 flex flex-col items-center gap-6">
              <PlaceholderQRCode />

              {/* Brightness Tip */}
              <div className="flex items-center gap-3 bg-[#c5d4b8]/20 text-[#7a9a6a] px-4 py-3 rounded-lg">
                <Sun className="h-5 w-5 shrink-0" />
                <span className="text-sm">
                  {t('orderConfirmation.increaseBrightness')}
                </span>
              </div>

              {/* Installation Steps */}
              <div className="w-full">
                <h3 className="font-semibold mb-4">{t('orderConfirmation.howToInstall')}</h3>
                <ol className="space-y-3">
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      1
                    </span>
                    <span className="text-sm">
                      Go to <strong>Settings {'>'} Mobile Data {'>'} Add eSIM</strong> on
                      your device.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      2
                    </span>
                    <span className="text-sm">
                      Select <strong>&quot;Use QR Code&quot;</strong> when prompted.
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      3
                    </span>
                    <span className="text-sm">{t('orderConfirmation.scanCode')}</span>
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>

          {/* Plan Details Section */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                {t('orderConfirmation.planDetails')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t('orderConfirmation.network')}</span>
                  <span className="font-medium flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-primary/20 flex items-center justify-center text-xs font-bold">
                      {firstItem?.networkType?.[0] || 'L'}
                    </span>
                    {firstItem?.networkType || 'LTE'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t('orderConfirmation.region')}</span>
                  <span className="font-medium flex items-center gap-2">
                    {firstItem?.iconUrl && (
                      <Image
                        src={firstItem.iconUrl}
                        alt={firstItem.region || 'Region'}
                        width={20}
                        height={20}
                        className="rounded-sm"
                      />
                    )}
                    {firstItem?.region || firstItem?.title || 'Region'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t('orderConfirmation.dataPlan')}</span>
                  <span className="font-medium">{dataPlan}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t('orderConfirmation.validity')}</span>
                  <span className="font-medium">{validity}</span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">{t('orderConfirmation.iccid')}</span>
                  <button
                    onClick={handleCopyICCID}
                    className="flex items-center gap-2 bg-muted px-3 py-2 rounded-lg text-sm font-mono hover:bg-muted/80 transition-colors"
                  >
                    {iccid}
                    <Copy className="h-4 w-4 text-muted-foreground" />
                  </button>
                </div>
              </div>

              {/* Support Link */}
              <div className="pt-4 border-t border-border">
                <Link
                  href="/support"
                  className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <HelpCircle className="h-4 w-4" />
                  {t('orderConfirmation.troubleActivating')}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSendToEmail}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            {t('orderConfirmation.sendToEmail')}
          </Button>
          <Button size="lg" onClick={handleDownloadQR} className="gap-2">
            <Download className="h-4 w-4" />
            {t('orderConfirmation.downloadQr')}
          </Button>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-8">
          <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground underline">
            {t('orderConfirmation.continueShopping')}
          </Link>
        </div>
      </div>
    </div>
  )
}
