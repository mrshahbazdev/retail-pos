<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Users, Plus, Search } from 'lucide-vue-next'

const authStore = useAuthStore()
const customers = ref<
  Array<{
    id: number
    name: string
    phone: string | null
    totalSpent: number
    totalCredit: number
    loyaltyPoints: number
  }>
>([])
const searchQuery = ref('')
const loading = ref(true)
const total = ref(0)

onMounted(async () => {
  await loadCustomers()
})

async function loadCustomers(): Promise<void> {
  if (!authStore.business) return
  loading.value = true
  try {
    const result = await window.electron.ipcRenderer.invoke('customers:list', {
      businessId: authStore.business.id,
      search: searchQuery.value || undefined
    })
    customers.value = result.data
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
        <h1 class="text-xl font-bold text-slate-900">Customers</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">{{ total }} customers total</p>
      </div>
      <button
        class="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Add Customer
      </button>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-md group">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, phone, CNIC..."
          class="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400"
          @input="loadCustomers()"
        />
      </div>
    </div>

    <!-- Loading skeleton -->
    <div v-if="loading" class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex gap-4">
        <div class="skeleton h-4 w-20" />
        <div class="skeleton h-4 w-24" />
        <div class="skeleton h-4 w-20 ml-auto" />
        <div class="skeleton h-4 w-16" />
        <div class="skeleton h-4 w-24" />
      </div>
      <div v-for="n in 5" :key="n" class="px-4 py-3.5 border-b border-slate-50 flex gap-4">
        <div class="skeleton h-4 w-28" />
        <div class="skeleton h-4 w-24" />
        <div class="skeleton h-4 w-20 ml-auto" />
        <div class="skeleton h-4 w-16" />
        <div class="skeleton h-4 w-12" />
      </div>
    </div>

    <div v-else class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50/80 border-b border-slate-200">
            <th
              class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Name
            </th>
            <th
              class="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Phone
            </th>
            <th
              class="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Total Spent
            </th>
            <th
              class="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Credit
            </th>
            <th
              class="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-4 py-3"
            >
              Loyalty Points
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="customers.length === 0">
            <td colspan="5" class="text-center py-16">
              <div
                class="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3"
              >
                <Users class="w-7 h-7 text-slate-300" />
              </div>
              <p class="text-sm font-medium text-slate-400">No customers yet</p>
              <p class="text-xs text-slate-400 mt-1">Customers will appear here after first sale</p>
            </td>
          </tr>
          <tr
            v-for="customer in customers"
            :key="customer.id"
            class="hover:bg-slate-50/80 cursor-pointer"
          >
            <td class="px-4 py-3 text-[13px] font-medium text-slate-800">{{ customer.name }}</td>
            <td class="px-4 py-3 text-[13px] text-slate-500">{{ customer.phone || '-' }}</td>
            <td class="px-4 py-3 text-[13px] text-right text-slate-500">
              {{ formatCurrency(customer.totalSpent || 0) }}
            </td>
            <td class="px-4 py-3 text-[13px] text-right">
              <span
                :class="
                  (customer.totalCredit || 0) > 0 ? 'text-red-600 font-semibold' : 'text-slate-500'
                "
              >
                {{ formatCurrency(customer.totalCredit || 0) }}
              </span>
            </td>
            <td class="px-4 py-3 text-[13px] text-right text-slate-500">
              {{ customer.loyaltyPoints || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
