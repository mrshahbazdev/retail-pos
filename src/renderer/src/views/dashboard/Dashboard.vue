<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@renderer/stores/auth.store'
import Stat from '@renderer/components/ui/Stat.vue'
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  ArrowRight,
  Clock,
  Receipt
} from 'lucide-vue-next'

const authStore = useAuthStore()
const loading = ref(true)

const dashboard = ref({
  sales: { totalSales: 0, totalOrders: 0, totalProfit: 0, avgOrderValue: 0 },
  expenses: { totalExpenses: 0 },
  topProducts: [] as Array<{ productName: string; totalQuantity: number; totalRevenue: number }>,
  recentSales: [] as Array<{ id: number; invoiceNumber: string; total: number; saleDate: string }>,
  lowStockProducts: [] as Array<{
    id: number
    name: string
    stockQuantity: number
    minStockLevel: number
  }>,
  paymentBreakdown: [] as Array<{ method: string; total: number; count: number }>,
  creditOutstanding: 0
})

onMounted(async () => {
  try {
    const today = new Date()
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).toISOString()
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59
    ).toISOString()

    const result = await window.electron.ipcRenderer.invoke(
      'reports:dashboard',
      authStore.business?.id,
      startOfDay,
      endOfDay
    )
    dashboard.value = result
  } catch (e) {
    console.error('Failed to load dashboard:', e)
  } finally {
    loading.value = false
  }
})

function formatCurrency(amount: number): string {
  const symbol = authStore.business?.currencySymbol || '₨'
  return `${symbol} ${amount.toLocaleString('en-PK', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-PK', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Dashboard</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">
          Today's overview for {{ authStore.business?.name }}
        </p>
      </div>
      <div class="text-[11px] text-slate-400 flex items-center gap-1.5">
        <Clock class="w-3.5 h-3.5" />
        {{
          new Date().toLocaleDateString('en-PK', {
            weekday: 'long',
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })
        }}
      </div>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading">
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="n in 4" :key="n" class="bg-white border border-slate-200 rounded-lg p-5">
          <div class="skeleton h-4 w-24 mb-3" />
          <div class="skeleton h-7 w-32 mb-2" />
          <div class="skeleton h-3 w-16" />
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5">
          <div class="skeleton h-5 w-32 mb-4" />
          <div v-for="n in 4" :key="n" class="skeleton h-10 w-full mb-2" />
        </div>
        <div class="bg-white border border-slate-200 rounded-lg p-5">
          <div class="skeleton h-5 w-28 mb-4" />
          <div v-for="n in 3" :key="n" class="skeleton h-8 w-full mb-2" />
        </div>
      </div>
    </template>

    <template v-else>
      <!-- Stats Grid -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat
          label="Today's Sales"
          :value="formatCurrency(dashboard.sales.totalSales)"
          :icon="DollarSign"
          icon-color="bg-blue-50 text-blue-600"
        />
        <Stat
          label="Orders"
          :value="String(dashboard.sales.totalOrders)"
          :icon="ShoppingCart"
          icon-color="bg-green-50 text-green-600"
        />
        <Stat
          label="Profit"
          :value="formatCurrency(dashboard.sales.totalProfit)"
          :icon="TrendingUp"
          icon-color="bg-emerald-50 text-emerald-600"
        />
        <Stat
          label="Avg. Order"
          :value="formatCurrency(dashboard.sales.avgOrderValue)"
          :icon="Users"
          icon-color="bg-purple-50 text-purple-600"
        />
      </div>

      <!-- Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Recent Sales -->
        <div class="lg:col-span-2 bg-white rounded-lg border border-slate-200">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 class="text-[13px] font-semibold text-slate-900">Recent Sales</h2>
            <router-link
              to="/sales"
              class="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium"
            >
              View all <ArrowRight class="w-3 h-3" />
            </router-link>
          </div>
          <div v-if="dashboard.recentSales.length === 0" class="p-10 text-center">
            <div
              class="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3"
            >
              <ShoppingCart class="w-6 h-6 text-slate-300" />
            </div>
            <p class="text-sm font-medium text-slate-400">No sales yet today</p>
            <p class="text-xs text-slate-400 mt-1">Sales will appear here as they come in</p>
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="sale in dashboard.recentSales"
              :key="sale.id"
              class="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0"
                >
                  <Receipt class="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <span class="text-sm font-medium text-slate-700">{{ sale.invoiceNumber }}</span>
                  <div class="text-[11px] text-slate-400 mt-0.5">
                    {{ formatTime(sale.saleDate) }}
                  </div>
                </div>
              </div>
              <span class="text-sm font-semibold text-slate-900">{{
                formatCurrency(sale.total)
              }}</span>
            </div>
          </div>
        </div>

        <!-- Low Stock Alerts -->
        <div class="bg-white rounded-lg border border-slate-200">
          <div class="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
            <h2 class="text-[13px] font-semibold text-slate-900">Low Stock Alerts</h2>
            <span v-if="dashboard.lowStockProducts.length > 0" class="badge badge-danger ms-2">
              {{ dashboard.lowStockProducts.length }}
            </span>
          </div>
          <div v-if="dashboard.lowStockProducts.length === 0" class="p-10 text-center">
            <div
              class="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-3"
            >
              <Package class="w-6 h-6 text-green-400" />
            </div>
            <p class="text-sm font-medium text-slate-400">All products stocked</p>
            <p class="text-xs text-slate-400 mt-1">No low stock alerts</p>
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="product in dashboard.lowStockProducts"
              :key="product.id"
              class="flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <AlertTriangle class="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span class="text-sm text-slate-700 truncate">{{ product.name }}</span>
              </div>
              <span
                class="text-[11px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full flex-shrink-0 ml-2"
              >
                {{ product.stockQuantity }} left
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
