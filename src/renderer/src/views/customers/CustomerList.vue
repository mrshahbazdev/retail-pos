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
        <h1 class="text-xl font-semibold text-slate-900">Customers</h1>
        <p class="text-sm text-slate-500">{{ total }} customers total</p>
      </div>
      <button
        class="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        Add Customer
      </button>
    </div>

    <div class="flex items-center gap-3">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name, phone, CNIC..."
          class="w-full h-9 pl-10 pr-4 bg-white border border-slate-200 rounded-md text-sm focus:border-blue-400"
          @input="loadCustomers()"
        />
      </div>
    </div>

    <div class="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200">
            <th class="text-left text-xs font-medium text-slate-500 px-4 py-3">Name</th>
            <th class="text-left text-xs font-medium text-slate-500 px-4 py-3">Phone</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Total Spent</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Credit</th>
            <th class="text-right text-xs font-medium text-slate-500 px-4 py-3">Loyalty Points</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-if="customers.length === 0">
            <td colspan="5" class="text-center py-12">
              <Users class="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p class="text-sm text-slate-500">No customers yet</p>
            </td>
          </tr>
          <tr
            v-for="customer in customers"
            :key="customer.id"
            class="hover:bg-slate-50 cursor-pointer"
          >
            <td class="px-4 py-3 text-sm font-medium text-slate-800">{{ customer.name }}</td>
            <td class="px-4 py-3 text-sm text-slate-600">{{ customer.phone || '-' }}</td>
            <td class="px-4 py-3 text-sm text-right text-slate-600">
              {{ formatCurrency(customer.totalSpent || 0) }}
            </td>
            <td class="px-4 py-3 text-sm text-right">
              <span
                :class="
                  (customer.totalCredit || 0) > 0 ? 'text-red-600 font-medium' : 'text-slate-600'
                "
              >
                {{ formatCurrency(customer.totalCredit || 0) }}
              </span>
            </td>
            <td class="px-4 py-3 text-sm text-right text-slate-600">
              {{ customer.loyaltyPoints || 0 }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
