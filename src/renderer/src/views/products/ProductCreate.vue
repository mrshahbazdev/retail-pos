<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@renderer/stores/auth.store'
import { ArrowLeft, Save } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const categories = ref<Array<{ id: number; name: string }>>([])

const form = ref({
  name: '',
  nameLocal: '',
  description: '',
  sku: '',
  barcode: '',
  categoryId: null as number | null,
  costPrice: 0,
  salePrice: 0,
  wholesalePrice: 0,
  taxRate: 0,
  taxInclusive: 0,
  trackInventory: 1,
  stockQuantity: 0,
  minStockLevel: 5,
  stockUnit: 'piece',
  brand: '',
  weight: 0,
  weightUnit: 'kg'
})

onMounted(async () => {
  if (authStore.business) {
    categories.value = await window.electron.ipcRenderer.invoke(
      'categories:list',
      authStore.business.id
    )
    form.value.taxRate = authStore.business.defaultTaxRate || 0
  }
})

async function saveProduct(): Promise<void> {
  if (!authStore.business) return
  if (!form.value.name) return

  loading.value = true
  try {
    await window.electron.ipcRenderer.invoke('products:create', {
      businessId: authStore.business.id,
      ...form.value
    })
    router.push('/products')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-5 max-w-3xl">
    <div class="flex items-center gap-3">
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        @click="router.back()"
      >
        <ArrowLeft class="w-5 h-5" />
      </button>
      <div>
        <h1 class="text-xl font-bold text-slate-900">Add Product</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">Add a new product to your inventory</p>
      </div>
    </div>

    <form class="space-y-5" @submit.prevent="saveProduct">
      <!-- Basic Info -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 class="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">
          Basic Information
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">
              Product Name <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              placeholder="Enter product name"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">SKU</label>
            <input
              v-model="form.sku"
              type="text"
              placeholder="Auto-generated or custom"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Barcode</label>
            <input
              v-model="form.barcode"
              type="text"
              placeholder="Scan or type barcode"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Category</label>
            <select
              v-model="form.categoryId"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400 bg-white"
            >
              <option :value="null">No category</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Brand</label>
            <input
              v-model="form.brand"
              type="text"
              placeholder="Brand name"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <!-- Pricing -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 class="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">Pricing</h2>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">
              Cost Price <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.costPrice"
              type="number"
              step="0.01"
              min="0"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">
              Sale Price <span class="text-red-500">*</span>
            </label>
            <input
              v-model.number="form.salePrice"
              type="number"
              step="0.01"
              min="0"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Tax Rate (%)</label>
            <input
              v-model.number="form.taxRate"
              type="number"
              step="0.1"
              min="0"
              max="100"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
        </div>
      </div>

      <!-- Stock -->
      <div class="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <h2 class="text-[13px] font-semibold text-slate-900 uppercase tracking-wider">
          Stock Management
        </h2>
        <div class="grid grid-cols-3 gap-4">
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Current Stock</label>
            <input
              v-model.number="form.stockQuantity"
              type="number"
              min="0"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">
              Min Stock Level
            </label>
            <input
              v-model.number="form.minStockLevel"
              type="number"
              min="0"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400"
            />
          </div>
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Unit</label>
            <select
              v-model="form.stockUnit"
              class="w-full h-9 px-3 border border-slate-300 rounded-lg text-sm focus:border-blue-400 bg-white"
            >
              <option value="piece">Piece</option>
              <option value="kg">Kilogram</option>
              <option value="g">Gram</option>
              <option value="liter">Liter</option>
              <option value="ml">Milliliter</option>
              <option value="meter">Meter</option>
              <option value="dozen">Dozen</option>
              <option value="box">Box</option>
              <option value="pack">Pack</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="h-9 px-4 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          @click="router.back()"
        >
          Cancel
        </button>
        <button
          type="submit"
          :disabled="loading || !form.name"
          class="h-9 px-5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2"
        >
          <Save class="w-4 h-4" />
          {{ loading ? 'Saving...' : 'Save Product' }}
        </button>
      </div>
    </form>
  </div>
</template>
