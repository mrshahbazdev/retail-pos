<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@renderer/stores/auth.store'
import { usePosStore } from '@renderer/stores/pos.store'
import {
  Search,
  Barcode,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Smartphone,
  Pause,
  X,
  Check
} from 'lucide-vue-next'

const authStore = useAuthStore()
const posStore = usePosStore()

const searchQuery = ref('')
const products = ref<
  Array<{
    id: number
    name: string
    sku: string
    barcode: string
    salePrice: number
    costPrice: number
    stockQuantity: number
    taxRate: number
    imagePath: string | null
    categoryId: number | null
  }>
>([])
const categories = ref<Array<{ id: number; name: string; color: string }>>([])
const selectedCategory = ref<number | null>(null)
const showPaymentModal = ref(false)
const paymentMethod = ref('cash')
const paidAmount = ref(0)
const loading = ref(false)
const barcodeBuffer = ref('')

const filteredProducts = computed(() => {
  let list = products.value
  if (selectedCategory.value) {
    list = list.filter((p) => p.categoryId === selectedCategory.value)
  }
  if (searchQuery.value) {
    const term = searchQuery.value.toLowerCase()
    list = list.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term)
    )
  }
  return list
})

const changeAmount = computed(() => {
  return Math.max(0, paidAmount.value - posStore.total)
})

onMounted(async () => {
  await loadProducts()
  await loadCategories()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

async function loadProducts(): Promise<void> {
  if (!authStore.business) return
  const result = await window.electron.ipcRenderer.invoke('products:list', {
    businessId: authStore.business.id,
    isActive: 1,
    limit: 500
  })
  products.value = result.data
}

async function loadCategories(): Promise<void> {
  if (!authStore.business) return
  categories.value = await window.electron.ipcRenderer.invoke(
    'categories:list',
    authStore.business.id
  )
}

function addProductToCart(product: (typeof products.value)[0]): void {
  posStore.addItem({
    id: product.id,
    name: product.name,
    sku: product.sku,
    salePrice: product.salePrice,
    costPrice: product.costPrice,
    taxRate: product.taxRate || 0,
    imagePath: product.imagePath || undefined,
    stockQuantity: product.stockQuantity
  })
}

async function handleBarcodeScan(barcode: string): Promise<void> {
  if (!authStore.business) return
  const result = await window.electron.ipcRenderer.invoke(
    'products:search-barcode',
    barcode,
    authStore.business.id
  )
  if (result) {
    const product = result.type === 'product' ? result.data : result.product
    if (product) addProductToCart(product)
  }
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && barcodeBuffer.value.length >= 4) {
    handleBarcodeScan(barcodeBuffer.value)
    barcodeBuffer.value = ''
    return
  }

  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const activeEl = document.activeElement
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return
    barcodeBuffer.value += e.key
    setTimeout(() => {
      barcodeBuffer.value = ''
    }, 100)
  }

  if (e.key === 'F2') {
    e.preventDefault()
    if (posStore.items.length > 0) openPayment()
  }
  if (e.key === 'F4') {
    e.preventDefault()
    posStore.holdSale()
  }
  if (e.key === 'Escape') {
    e.preventDefault()
    showPaymentModal.value = false
  }
}

function openPayment(): void {
  paidAmount.value = posStore.total
  paymentMethod.value = 'cash'
  showPaymentModal.value = true
}

async function completeSale(): Promise<void> {
  if (!authStore.business || !authStore.user) return
  loading.value = true
  try {
    const due = Math.max(0, posStore.total - paidAmount.value)
    const result = await window.electron.ipcRenderer.invoke('sales:create', {
      businessId: authStore.business.id,
      userId: authStore.user.id,
      customerId: posStore.selectedCustomerId,
      items: posStore.items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        productName: item.name,
        productSku: item.sku,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice,
        discountType: item.discountType,
        discountValue: item.discountValue,
        discountAmount: item.discountAmount,
        taxRate: item.taxRate,
        taxAmount: item.taxAmount,
        subtotal: item.subtotal,
        total: item.total
      })),
      subtotal: posStore.subtotal,
      discountType: posStore.cartDiscount.type || undefined,
      discountValue: posStore.cartDiscount.value || undefined,
      discountAmount: posStore.cartDiscount.amount || undefined,
      taxAmount: posStore.totalTax,
      total: posStore.total,
      paidAmount: paidAmount.value,
      changeAmount: changeAmount.value,
      dueAmount: due,
      paymentStatus: due > 0 ? 'credit' : 'paid',
      paymentMethod: paymentMethod.value,
      notes: posStore.cartNotes || undefined
    })

    if (result.success) {
      showPaymentModal.value = false
      posStore.clearCart()
      await loadProducts()
    }
  } catch (e) {
    console.error('Sale failed:', e)
  } finally {
    loading.value = false
  }
}

function formatCurrency(amount: number): string {
  const symbol = authStore.business?.currencySymbol || '₨'
  return `${symbol} ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0 })}`
}
</script>

<template>
  <div class="h-[calc(100vh-3.5rem)] flex">
    <!-- Left: Products -->
    <div class="flex-1 flex flex-col bg-slate-50 border-r border-slate-200">
      <!-- Search & Categories -->
      <div class="p-4 bg-white border-b border-slate-100 space-y-3">
        <div class="relative group">
          <Search
            class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
          />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search or scan barcode..."
            class="w-full h-10 pl-10 pr-10 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:bg-white"
          />
          <Barcode class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
        </div>
        <div v-if="categories.length > 0" class="flex gap-1.5 overflow-x-auto pb-1">
          <button
            class="flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-medium transition-all duration-150"
            :class="
              selectedCategory === null
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            "
            @click="selectedCategory = null"
          >
            All
          </button>
          <button
            v-for="cat in categories"
            :key="cat.id"
            class="flex-shrink-0 h-7 px-3 rounded-full text-[11px] font-medium transition-all duration-150"
            :class="
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            "
            @click="selectedCategory = cat.id"
          >
            {{ cat.name }}
          </button>
        </div>
      </div>

      <!-- Product Grid -->
      <div class="flex-1 overflow-y-auto p-4">
        <div
          v-if="filteredProducts.length === 0"
          class="flex flex-col items-center justify-center h-full text-slate-400"
        >
          <div class="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
            <Barcode class="w-7 h-7 text-slate-300" />
          </div>
          <p class="text-sm font-medium">No products found</p>
          <p class="text-xs mt-1">Add products from the Products page</p>
        </div>
        <div v-else class="grid grid-cols-3 xl:grid-cols-4 gap-3">
          <button
            v-for="product in filteredProducts"
            :key="product.id"
            class="bg-white border border-slate-200 rounded-lg p-3.5 text-left hover:border-blue-300 hover:shadow-sm transition-all duration-150 group"
            @click="addProductToCart(product)"
          >
            <div
              class="text-[13px] font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors"
            >
              {{ product.name }}
            </div>
            <div class="text-[11px] text-slate-400 mt-1">{{ product.sku || 'No SKU' }}</div>
            <div class="flex items-center justify-between mt-2.5">
              <span class="text-sm font-bold text-slate-900">
                {{ formatCurrency(product.salePrice) }}
              </span>
              <span
                class="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                :class="
                  product.stockQuantity > 10
                    ? 'bg-green-50 text-green-700'
                    : product.stockQuantity > 0
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-red-50 text-red-700'
                "
              >
                {{ product.stockQuantity }}
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Right: Cart -->
    <div class="w-[380px] flex flex-col bg-white">
      <!-- Cart Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <h2 class="text-[13px] font-semibold text-slate-900">
          Cart
          <span v-if="posStore.itemCount > 0" class="text-[11px] text-slate-400 ml-1 font-normal">
            ({{ posStore.itemCount }} items)
          </span>
        </h2>
        <div class="flex items-center gap-1">
          <button
            v-if="posStore.items.length > 0"
            class="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Hold sale (F4)"
            @click="posStore.holdSale()"
          >
            <Pause class="w-3.5 h-3.5" />
          </button>
          <button
            v-if="posStore.items.length > 0"
            class="w-7 h-7 rounded-md flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            title="Clear cart"
            @click="posStore.clearCart()"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Customer -->
      <div class="flex items-center gap-2 px-4 py-2 bg-slate-50/80 border-b border-slate-100">
        <User class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-[11px] text-slate-500">{{ posStore.selectedCustomerName }}</span>
      </div>

      <!-- Cart Items -->
      <div class="flex-1 overflow-y-auto">
        <div
          v-if="posStore.items.length === 0"
          class="flex flex-col items-center justify-center h-full text-slate-400"
        >
          <p class="text-[13px]">Cart is empty</p>
          <p class="text-[11px] mt-1 text-slate-300">Scan a barcode or select a product</p>
        </div>
        <div v-else class="divide-y divide-slate-50">
          <div
            v-for="item in posStore.items"
            :key="item.id"
            class="px-4 py-3 flex gap-3 hover:bg-slate-50/50 transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="text-[13px] font-medium text-slate-800 truncate">{{ item.name }}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                {{ formatCurrency(item.unitPrice) }} each
              </div>
              <div class="flex items-center gap-2 mt-2">
                <button
                  class="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  @click="posStore.updateQuantity(item.id, item.quantity - 1)"
                >
                  <Minus class="w-3 h-3" />
                </button>
                <span class="w-7 text-center text-[13px] font-semibold">{{ item.quantity }}</span>
                <button
                  class="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                  @click="posStore.updateQuantity(item.id, item.quantity + 1)"
                >
                  <Plus class="w-3 h-3" />
                </button>
              </div>
            </div>
            <div class="flex flex-col items-end justify-between">
              <button
                class="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                @click="posStore.removeItem(item.id)"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
              <span class="text-[13px] font-bold text-slate-900">
                {{ formatCurrency(item.total) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Footer -->
      <div class="border-t border-slate-200 p-4 space-y-2.5">
        <div class="flex justify-between text-[13px]">
          <span class="text-slate-500">Subtotal</span>
          <span class="font-medium text-slate-700">{{ formatCurrency(posStore.subtotal) }}</span>
        </div>
        <div v-if="posStore.totalDiscount > 0" class="flex justify-between text-[13px]">
          <span class="text-slate-500">Discount</span>
          <span class="font-medium text-red-600"
            >-{{ formatCurrency(posStore.totalDiscount) }}</span
          >
        </div>
        <div v-if="posStore.totalTax > 0" class="flex justify-between text-[13px]">
          <span class="text-slate-500">Tax</span>
          <span class="font-medium text-slate-700">{{ formatCurrency(posStore.totalTax) }}</span>
        </div>
        <div class="flex justify-between text-base font-bold pt-2.5 border-t border-slate-200">
          <span>Total</span>
          <span class="text-blue-600">{{ formatCurrency(posStore.total) }}</span>
        </div>
        <button
          :disabled="posStore.items.length === 0"
          class="w-full h-11 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 active:scale-[0.98] text-sm flex items-center justify-center gap-2 shadow-sm"
          @click="openPayment"
        >
          <CreditCard class="w-4 h-4" />
          Pay {{ formatCurrency(posStore.total) }}
          <kbd class="text-[10px] opacity-60 ml-1 px-1 py-0.5 bg-blue-700 rounded">F2</kbd>
        </button>
      </div>
    </div>

    <!-- Payment Modal -->
    <div
      v-if="showPaymentModal"
      class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      @click.self="showPaymentModal = false"
    >
      <div class="bg-white rounded-xl w-[420px] shadow-2xl border border-slate-200">
        <div class="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900">Payment</h3>
          <button
            class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            @click="showPaymentModal = false"
          >
            <X class="w-4 h-4" />
          </button>
        </div>

        <div class="p-5 space-y-4">
          <div class="text-center p-4 bg-slate-50 rounded-lg">
            <div class="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Total Amount
            </div>
            <div class="text-3xl font-bold text-slate-900 mt-1">
              {{ formatCurrency(posStore.total) }}
            </div>
          </div>

          <!-- Payment Methods -->
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-2 block">Payment Method</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                class="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-150"
                :class="
                  paymentMethod === 'cash'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                "
                @click="paymentMethod = 'cash'"
              >
                <Banknote class="w-5 h-5 text-green-600" />
                <span class="text-[11px] font-semibold">Cash</span>
              </button>
              <button
                class="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-150"
                :class="
                  paymentMethod === 'card'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                "
                @click="paymentMethod = 'card'"
              >
                <CreditCard class="w-5 h-5 text-blue-600" />
                <span class="text-[11px] font-semibold">Card</span>
              </button>
              <button
                class="flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all duration-150"
                :class="
                  paymentMethod === 'mobile'
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                "
                @click="paymentMethod = 'mobile'"
              >
                <Smartphone class="w-5 h-5 text-purple-600" />
                <span class="text-[11px] font-semibold">Mobile</span>
              </button>
            </div>
          </div>

          <!-- Paid Amount -->
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Paid Amount</label>
            <input
              v-model.number="paidAmount"
              type="number"
              step="1"
              min="0"
              class="w-full h-11 px-3 border border-slate-300 rounded-lg text-base font-semibold text-right focus:border-blue-400"
            />
          </div>

          <!-- Change -->
          <div
            v-if="changeAmount > 0"
            class="flex justify-between items-center text-sm bg-green-50 border border-green-100 px-4 py-2.5 rounded-lg"
          >
            <span class="text-green-700 font-medium">Change</span>
            <span class="font-bold text-green-700">{{ formatCurrency(changeAmount) }}</span>
          </div>

          <!-- Due -->
          <div
            v-if="paidAmount < posStore.total"
            class="flex justify-between items-center text-sm bg-amber-50 border border-amber-100 px-4 py-2.5 rounded-lg"
          >
            <span class="text-amber-700 font-medium">Due Amount</span>
            <span class="font-bold text-amber-700">
              {{ formatCurrency(posStore.total - paidAmount) }}
            </span>
          </div>
        </div>

        <div class="flex gap-3 p-5 border-t border-slate-100">
          <button
            class="flex-1 h-10 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            @click="showPaymentModal = false"
          >
            Cancel
          </button>
          <button
            :disabled="loading || paidAmount <= 0"
            class="flex-1 h-10 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center justify-center gap-2"
            @click="completeSale"
          >
            <Check v-if="!loading" class="w-4 h-4" />
            {{ loading ? 'Processing...' : 'Complete Sale' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
