import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'

export const Countries: CollectionConfig = {
  slug: 'countries',
  access: {
    read: () => true,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Content',
    defaultColumns: ['name', 'code', 'flagUrl'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    {
      name: 'code',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'ISO country code (e.g., US, GB, ES)',
      },
    },
    {
      name: 'flagUrl',
      type: 'text',
      admin: {
        description: 'URL to country flag image',
      },
    },
    slugField({
      position: undefined,
    }),
  ],
}
