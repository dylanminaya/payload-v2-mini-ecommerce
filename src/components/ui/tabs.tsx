'use client'

import { cn } from '@/utilities/cn'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type Tab = {
  label: string
  value: string
}

type TabsProps = {
  tabs: Tab[]
  paramName?: string
  defaultValue?: string
  className?: string
}

export function Tabs({ tabs, paramName = 'tab', defaultValue, className }: TabsProps) {
  const searchParams = useSearchParams()
  const currentTab = searchParams.get(paramName) || defaultValue || tabs[0]?.value

  return (
    <div className={cn('flex gap-2 border-b border-border', className)}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.value
        const params = new URLSearchParams(searchParams.toString())
        params.set(paramName, tab.value)

        return (
          <Link
            key={tab.value}
            href={`?${params.toString()}`}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px',
              isActive
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-primary'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
