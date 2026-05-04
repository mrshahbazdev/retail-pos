<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Receipt, Download, Eye } from 'lucide-vue-next'

const authStore = useAuthStore()
const sales = ref<
  Array<{
    id: number
    invoiceNumber: string
    total: number
    paidAmount: number
    paymentStatus: string
    status: string
    saleDate: string
  }>
>([])
const loading = ref(true)
const total = ref(0)

onMounted(async () => {
  if (!authStore.business) return
  loading.value = true
  try {
    const result = await window.electron.ipcRenderer.invoke('sales:list', {
      businessId: authStore.business.id,
      limit: 50
    })
    sales.value = result.data
    total.value = result.total
  } finally {
    loading.value = false
  }
})

function formatCurrency(amount: number): string {
  const symbol = authStore.business?.currencySymbol || '₨'
  return `${symbol} ${amount.toLocaleString()}`
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Sales History</h1>
        <p class="text-sm text-slate-500">{{ total }} sales total</p>
      </div>
      <button
        class="h-9 px-3 border border-slate-200 rounded-md text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
      >
        <Download class="w-4 h-4" />
        Export
      </button>
    </div>

    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="text-left text-xs font-medium text-slate-500 px-4 py-3">Invoice</th>
            <th class="text-left text-xs font-medium text-slate-500 px-4 py-3">Date</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Total</th>
            <th class="text-center text-xs font-medium text-slate-500 px-4 py-3">Payment</th>
            <th class="text-center text-xs font-medium text-slate-500 px-4 py-3">Status</th>
            <th class="text-center text-xs font-medium text-slate-500 px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="sales.length === 0">
            <td colspan="6" class="text-center py-12">
              <Receipt class="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p class="text-sm text-slate-500">No sales yet</p>
            </td>
          </tr>
          <tr v-for="sale in sales" :key="sale.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 text-sm font-medium text-blue-600">{{ sale.invoiceNumber }}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{{ formatDate(sale.saleDate) }}</td>
            <td class="px-4 py-3 text-sm text-right font-medium text-slate-800">
              {{ formatCurrency(sale.total) }}
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full"
                :class="
                  sale.paymentStatus === 'paid'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                "
              >
                {{ sale.paymentStatus }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <span
                class="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 capitalize"
              >
                {{ sale.status }}
              </span>
            </td>
            <td class="px-4 py-3 text-center">
              <button
                class="w-7 h-7 rounded-md inline-flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <Eye class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
