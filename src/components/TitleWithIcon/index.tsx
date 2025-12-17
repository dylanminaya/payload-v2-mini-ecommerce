'use client'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

interface CellComponentProps {
    cellData?: string
    rowData?: {
        id?: string
        title?: string
        iconUrl?: string
    }
}

export const TitleWithIcon = ({ cellData, rowData }: CellComponentProps) => {
    const router = useRouter()
    const title = cellData || rowData?.title || ''
    const iconUrl = rowData?.iconUrl
    const id = rowData?.id

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (id) {
            router.push(`/admin/collections/products/${id}`)
        }
    }

    return (
        <div
            onClick={handleClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
            }}
        >
            {iconUrl && (
                <Image
                    src={iconUrl}
                    alt={`${title} icon`}
                    width={20}
                    height={20}
                    style={{ flexShrink: 0, display: 'block' }}
                />
            )}
            <span>{title}</span>
        </div>
    )
}
