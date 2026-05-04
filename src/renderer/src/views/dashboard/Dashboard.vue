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
  ArrowRight
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
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h1 class="text-xl font-semibold text-slate-900">Dashboard</h1>
      <p class="text-sm text-slate-500">Today's overview for {{ authStore.business?.name }}</p>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-4 gap-4">
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
    <div class="grid grid-cols-3 gap-6">
      <!-- Recent Sales -->
      <div class="col-span-2 bg-white rounded-lg border border-slate-200">
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-900">Recent Sales</h2>
          <router-link
            to="/sales"
            class="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View all <ArrowRight class="w-3 h-3" />
          </router-link>
        </div>
        <div v-if="dashboard.recentSales.length === 0" class="p-8 text-center">
          <ShoppingCart class="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p class="text-sm text-slate-500">No sales yet today</p>
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="sale in dashboard.recentSales"
            :key="sale.id"
            class="flex items-center justify-between px-4 py-3"
          >
            <div>
              <span class="text-sm font-medium text-slate-700">{{ sale.invoiceNumber }}</span>
            </div>
            <span class="text-sm font-semibold text-slate-900">{{
              formatCurrency(sale.total)
            }}</span>
          </div>
        </div>
      </div>

      <!-- Low Stock Alerts -->
      <div class="bg-white rounded-lg border border-slate-200">
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-900">Low Stock Alerts</h2>
          <span
            v-if="dashboard.lowStockProducts.length > 0"
            class="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium"
          >
            {{ dashboard.lowStockProducts.length }}
          </span>
        </div>
        <div v-if="dashboard.lowStockProducts.length === 0" class="p-8 text-center">
          <Package class="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p class="text-sm text-slate-500">All products stocked</p>
        </div>
        <div v-else class="divide-y divide-slate-100">
          <div
            v-for="product in dashboard.lowStockProducts"
            :key="product.id"
            class="flex items-center justify-between px-4 py-3"
          >
            <div class="flex items-center gap-2">
              <AlertTriangle class="w-4 h-4 text-amber-500" />
              <span class="text-sm text-slate-700 truncate">{{ product.name }}</span>
            </div>
            <span class="text-xs font-medium text-red-600">{{ product.stockQuantity }} left</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
