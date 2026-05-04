import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface CartItem {
  id: string
  productId: number
  variantId?: number
  name: string
  sku?: string
  variantName?: string
  quantity: number
  unitPrice: number
  costPrice: number
  discountType?: string
  discountValue?: number
  discountAmount: number
  taxRate: number
  taxAmount: number
  subtotal: number
  total: number
  imagePath?: string
  stockQuantity: number
}

interface HeldSale {
  id: string
  customerName: string
  items: CartItem[]
  createdAt: string
  notes?: string
}

export const usePosStore = defineStore('pos', () => {
  const items = ref<CartItem[]>([])
  const selectedCustomerId = ref<number | null>(null)
  const selectedCustomerName = ref<string>('Walk-in Customer')
  const cartDiscount = ref({ type: '', value: 0, amount: 0 })
  const cartNotes = ref('')
  const heldSales = ref<HeldSale[]>([])

  const itemCount = computed(() => items.value.reduce((sum, item) => sum + item.quantity, 0))

  const subtotal = computed(() => items.value.reduce((sum, item) => sum + item.subtotal, 0))

  const totalDiscount = computed(() => {
    const itemDiscounts = items.value.reduce((sum, item) => sum + item.discountAmount, 0)
    return itemDiscounts + cartDiscount.value.amount
  })

  const totalTax = computed(() => items.value.reduce((sum, item) => sum + item.taxAmount, 0))

  const total = computed(() => subtotal.value - cartDiscount.value.amount + totalTax.value)

  function addItem(product: {
    id: number
    variantId?: number
    name: string
    sku?: string
    variantName?: string
    salePrice: number
    costPrice: number
    taxRate?: number
    imagePath?: string
    stockQuantity: number
  }): void {
    const existing = items.value.find(
      (item) => item.productId === product.id && item.variantId === product.variantId
    )

    if (existing) {
      existing.quantity += 1
      recalculateItem(existing)
      return
    }

    const taxRate = product.taxRate || 0
    const unitPrice = product.salePrice
    const quantity = 1
    const sub = unitPrice * quantity
    const taxAmt = sub * (taxRate / 100)

    items.value.push({
      id: `${product.id}-${product.variantId || 0}-${Date.now()}`,
      productId: product.id,
      variantId: product.variantId,
      name: product.name,
      sku: product.sku,
      variantName: product.variantName,
      quantity,
      unitPrice,
      costPrice: product.costPrice,
      discountType: undefined,
      discountValue: undefined,
      discountAmount: 0,
      taxRate,
      taxAmount: taxAmt,
      subtotal: sub,
      total: sub + taxAmt,
      imagePath: product.imagePath,
      stockQuantity: product.stockQuantity
    })
  }

  function updateQuantity(itemId: string, quantity: number): void {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    item.quantity = quantity
    recalculateItem(item)
  }

  function removeItem(itemId: string): void {
    items.value = items.value.filter((i) => i.id !== itemId)
  }

  function recalculateItem(item: CartItem): void {
    item.subtotal = item.unitPrice * item.quantity
    if (item.discountType === 'percentage' && item.discountValue) {
      item.discountAmount = item.subtotal * (item.discountValue / 100)
    } else if (item.discountType === 'fixed' && item.discountValue) {
      item.discountAmount = item.discountValue
    }
    const afterDiscount = item.subtotal - item.discountAmount
    item.taxAmount = afterDiscount * (item.taxRate / 100)
    item.total = afterDiscount + item.taxAmount
  }

  function setCartDiscount(type: string, value: number): void {
    cartDiscount.value.type = type
    cartDiscount.value.value = value
    if (type === 'percentage') {
      cartDiscount.value.amount = subtotal.value * (value / 100)
    } else {
      cartDiscount.value.amount = value
    }
  }

  function holdSale(notes?: string): void {
    if (items.value.length === 0) return
    heldSales.value.push({
      id: `hold-${Date.now()}`,
      customerName: selectedCustomerName.value,
      items: [...items.value],
      createdAt: new Date().toISOString(),
      notes
    })
    clearCart()
  }

  function recallSale(heldId: string): void {
    const held = heldSales.value.find((h) => h.id === heldId)
    if (!held) return
    items.value = [...held.items]
    heldSales.value = heldSales.value.filter((h) => h.id !== heldId)
  }

  function clearCart(): void {
    items.value = []
    selectedCustomerId.value = null
    selectedCustomerName.value = 'Walk-in Customer'
    cartDiscount.value = { type: '', value: 0, amount: 0 }
    cartNotes.value = ''
  }

  function setCustomer(id: number | null, name: string): void {
    selectedCustomerId.value = id
    selectedCustomerName.value = name
  }

  return {
    items,
    selectedCustomerId,
    selectedCustomerName,
    cartDiscount,
    cartNotes,
    heldSales,
    itemCount,
    subtotal,
    totalDiscount,
    totalTax,
    total,
    addItem,
    updateQuantity,
    removeItem,
    setCartDiscount,
    holdSale,
    recallSale,
    clearCart,
    setCustomer
  }
})
