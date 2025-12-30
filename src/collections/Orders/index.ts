import { CollectionOverride } from '@payloadcms/plugin-ecommerce/types'
import { CollectionBeforeChangeHook } from 'payload'

// Generate random eSIM data
const generateRandomICCID = (): string => {
  // Generate a random 19-digit ICCID (sometimes 20 digits)
  const length = Math.random() > 0.5 ? 19 : 20
  let iccid = '89' // Start with 89 (standard ICCID prefix)
  for (let i = 2; i < length; i++) {
    iccid += Math.floor(Math.random() * 10)
  }
  return iccid
}

const generateRandomActivationCode = (): string => {
  // Generate a random activation code (typically alphanumeric)
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 32; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
    if ((i + 1) % 4 === 0 && i !== 31) code += '-'
  }
  return code
}

const generateSMDPAddress = (): string => {
  // Common SM-DP+ addresses
  const servers = [
    'dylan-globalcom',
    'esimgo-bacano.com',
  ]
  return servers[Math.floor(Math.random() * servers.length)]
}

// Hook to generate eSIM data for new orders
const generateESIMData: CollectionBeforeChangeHook = async ({ data, operation }) => {
  // Only generate for new orders
  if (operation === 'create') {
    const smdpAddress = generateSMDPAddress()
    const activationCode = generateRandomActivationCode()
    const iccid = generateRandomICCID()

    // LPA String format: LPA:1$SM-DP+Address$ActivationCode
    const lpaString = `LPA:1$${smdpAddress}$${activationCode}`

    return {
      ...data,
      smdpAddress,
      activationCode,
      lpaString,
      iccid,
    }
  }

  return data
}

// Hook to prevent any changes to orders from checkout
const preventCheckoutOrderChanges: CollectionBeforeChangeHook = async ({ data, req, operation }) => {
  // Only apply to updates (not creates)
  if (operation === 'update') {
    // Fetch the original document to check if it was created from checkout
    const originalDoc = await req.payload.findByID({
      collection: 'orders',
      id: req.data?.id || '',
    })

    if (originalDoc?.createdFromCheckout === true) {
      throw new Error('Orders created from checkout cannot be modified. This order is locked.')
    }
  }

  return data
}

export const OrdersCollection: CollectionOverride = ({ defaultCollection }) => ({
  ...defaultCollection,
  hooks: {
    ...defaultCollection.hooks,
    beforeChange: [
      ...(defaultCollection.hooks?.beforeChange || []),
      generateESIMData,
      preventCheckoutOrderChanges,
    ],
  },
  access: {
    ...defaultCollection.access,
    // Prevent updates only for orders created from checkout
    update: ({ req, data }) => {
      // If order was created from checkout, prevent updates
      if (data?.createdFromCheckout === true) {
        return false
      }
      // Use default access control for admin-created orders
      if (defaultCollection.access?.update) {
        return defaultCollection.access.update({ req, data })
      }
      return true
    },
    // Prevent deletion only for orders created from checkout
    delete: ({ req, data }) => {
      // If order was created from checkout, prevent deletion
      if (data?.createdFromCheckout === true) {
        return false
      }
      // Use default access control for admin-created orders
      if (defaultCollection.access?.delete) {
        return defaultCollection.access.delete({ req, data })
      }
      return true
    },
  },
  admin: {
    ...defaultCollection?.admin,
    description: 'Orders created from checkout are locked and cannot be edited or deleted. The edit icons may appear but will not function.',
    components: {
      ...defaultCollection?.admin?.components,
    },
  },
  fields: [
    // Add a field to track if order was created from checkout
    {
      name: 'createdFromCheckout',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'This order was created from the checkout process and is locked',
      },
    },
    // eSIM Fields
    {
      name: 'smdpAddress',
      type: 'text',
      label: 'SM-DP+ Address',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'The host server for the eSIM profile',
      },
    },
    {
      name: 'activationCode',
      type: 'text',
      label: 'Activation Code',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'The unique matching ID for the profile',
      },
    },
    {
      name: 'lpaString',
      type: 'textarea',
      label: 'LPA String',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Complete LPA string for copy-paste activation',
        rows: 3,
      },
    },
    {
      name: 'iccid',
      type: 'text',
      label: 'ICCID',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'The unique 19- or 20-digit serial number of the digital SIM card',
      },
    },
    ...defaultCollection.fields,
  ],
})
