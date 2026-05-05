<script setup lang="ts">
import {
  BarChart3,
  TrendingUp,
  Package,
  Users,
  Receipt,
  Wallet,
  type LucideIcon
} from 'lucide-vue-next'

interface ReportCard {
  icon: LucideIcon
  label: string
  description: string
  color: string
}

const reportCards: ReportCard[] = [
  {
    icon: BarChart3,
    label: 'Sales Report',
    description: 'Daily, weekly, monthly sales breakdown',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: TrendingUp,
    label: 'Profit & Loss',
    description: 'Revenue minus costs and expenses',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: Package,
    label: 'Stock Report',
    description: 'Current stock levels and valuation',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    icon: Users,
    label: 'Customer Report',
    description: 'Top customers and credit report',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Receipt,
    label: 'Tax Report',
    description: 'Tax collected and tax summary',
    color: 'bg-cyan-50 text-cyan-600'
  },
  {
    icon: Wallet,
    label: 'Expense Report',
    description: 'Expense tracking by category',
    color: 'bg-rose-50 text-rose-600'
  }
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Reports</h1>
      <p class="text-[13px] text-slate-500 mt-0.5">Business analytics and reports</p>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="card in reportCards"
        :key="card.label"
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-150 flex items-start gap-4"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="card.color"
        >
          <component :is="card.icon" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-[13px] font-semibold text-slate-800">{{ card.label }}</h3>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ card.description }}</p>
        </div>
      </div>
    </div>
    <div class="bg-white border border-slate-200 rounded-lg p-16 text-center">
      <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
        <BarChart3 class="w-8 h-8 text-slate-300" />
      </div>
      <p class="text-sm font-medium text-slate-500">Detailed Reports with Charts</p>
      <p class="text-xs text-slate-400 mt-1">Coming in Phase 3</p>
    </div>
  </div>
</template>
