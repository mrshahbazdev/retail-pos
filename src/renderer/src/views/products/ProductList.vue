<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Package, Plus, Search, Filter, Download } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const products = ref<
  Array<{
    id: number
    name: string
    sku: string
    barcode: string
    salePrice: number
    costPrice: number
    stockQuantity: number
    categoryId: number | null
    isActive: number
  }>
>([])
const searchQuery = ref('')
const loading = ref(true)
const total = ref(0)
const page = ref(1)

onMounted(async () => {
  await loadProducts()
})

async function loadProducts(): Promise<void> {
  if (!authStore.business) return
  loading.value = true
  try {
    const result = await window.electron.ipcRenderer.invoke('products:list', {
      businessId: authStore.business.id,
      search: searchQuery.value || undefined,
      page: page.value,
      limit: 50
    })
    products.value = result.data
    total.value = result.total
  } finally {
    loading.value = false
  }
}

function formatCurrency(amount: number): string {
  const symbol = authStore.business?.currencySymbol || '₨'
  return `${symbol} ${amount.toLocaleString()}`
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Products</h1>
        <p class="text-sm text-slate-500">{{ total }} products total</p>
      </div>
      <button
        class="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center gap-2"
        @click="router.push('/products/create')"
      >
        <Plus class="w-4 h-4" />
        Add Product
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products, SKU, barcode..."
          class="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-400"
          @input="loadProducts()"
        />
      </div>
      <button
        class="h-9 px-3 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
      >
        <Filter class="w-4 h-4" />
        Filters
      </button>
      <button
        class="h-9 px-3 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
      >
        <Download class="w-4 h-4" />
        Export
      </button>
    </div>

    <!-- Table -->
    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="text-left text-xs font-medium text-slate-500 px-4 py-3">Product</th>
            <th class="text-left text-xs font-medium text-slate-500 px-4 py-3">SKU</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Cost</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Sale Price</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Stock</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="products.length === 0 && !loading">
            <td colspan="5" class="text-center py-12">
              <Package class="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p class="text-sm text-slate-500">No products yet</p>
              <button
                class="text-sm text-blue-600 hover:text-blue-700 mt-1"
                @click="router.push('/products/create')"
              >
                Add your first product
              </button>
            </td>
          </tr>
          <tr
            v-for="product in products"
            :key="product.id"
            class="hover:bg-slate-50 cursor-pointer"
          >
            <td class="px-4 py-3">
              <div class="text-sm font-medium text-slate-800">{{ product.name }}</div>
              <div class="text-xs text-slate-400">{{ product.barcode || 'No barcode' }}</div>
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">{{ product.sku || '-' }}</td>
            <td class="px-4 py-3 text-sm text-right text-slate-600">
              {{ formatCurrency(product.costPrice) }}
            </td>
            <td class="px-4 py-3 text-sm text-right font-medium text-slate-800">
              {{ formatCurrency(product.salePrice) }}
            </td>
            <td class="px-4 py-3 text-right">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
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
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
