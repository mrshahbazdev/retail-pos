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
        <h1 class="text-xl font-bold text-slate-900">Products</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">{{ total }} products total</p>
      </div>
      <button
        class="btn btn-primary d-inline-flex align-items-center gap-2"
        @click="router.push('/products/create')"
      >
        <Plus class="w-4 h-4" />
        Add Product
      </button>
    </div>

    <!-- Search & Filters -->
    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-md group">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products, SKU, barcode..."
          class="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400"
          @input="loadProducts()"
        />
      </div>
      <button class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2">
        <Filter class="w-4 h-4" />
        Filters
      </button>
      <button class="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-2">
        <Download class="w-4 h-4" />
        Export
      </button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
        <div class="skeleton h-4 w-24" />
        <div class="skeleton h-4 w-16" />
        <div class="skeleton h-4 w-16 ml-auto" />
        <div class="skeleton h-4 w-20" />
        <div class="skeleton h-4 w-14" />
      </div>
      <div v-for="n in 6" :key="n" class="px-4 py-3.5 border-b border-slate-50 flex gap-4">
        <div class="skeleton h-4 w-32" />
        <div class="skeleton h-4 w-20" />
        <div class="skeleton h-4 w-16 ml-auto" />
        <div class="skeleton h-4 w-16" />
        <div class="skeleton h-4 w-12" />
      </div>
    </div>

    <!-- Table -->
    <div v-else class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200">
            <th
              class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Product
            </th>
            <th
              class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              SKU
            </th>
            <th
              class="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Cost
            </th>
            <th
              class="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Sale Price
            </th>
            <th
              class="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Stock
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="products.length === 0">
            <td colspan="5" class="text-center py-16">
              <div
                class="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3"
              >
                <Package class="w-7 h-7 text-slate-300" />
              </div>
              <p class="text-sm font-medium text-slate-400">No products yet</p>
              <button
                class="text-sm text-blue-600 hover:text-blue-700 mt-2 font-medium"
                @click="router.push('/products/create')"
              >
                Add your first product
              </button>
            </td>
          </tr>
          <tr
            v-for="product in products"
            :key="product.id"
            class="hover:bg-slate-50/80 cursor-pointer"
          >
            <td class="px-4 py-3">
              <div class="text-[13px] font-medium text-slate-800">{{ product.name }}</div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                {{ product.barcode || 'No barcode' }}
              </div>
            </td>
            <td class="px-4 py-3 text-[13px] text-slate-500">{{ product.sku || '-' }}</td>
            <td class="px-4 py-3 text-[13px] text-right text-slate-500">
              {{ formatCurrency(product.costPrice) }}
            </td>
            <td class="px-4 py-3 text-[13px] text-right font-semibold text-slate-800">
              {{ formatCurrency(product.salePrice) }}
            </td>
            <td class="px-4 py-3 text-right">
              <span
                class="badge"
                :class="
                  product.stockQuantity > 10
                    ? 'badge-success'
                    : product.stockQuantity > 0
                      ? 'badge-warning'
                      : 'badge-danger'
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
