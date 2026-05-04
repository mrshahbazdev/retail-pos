<script setup lang="ts">
import { BarChart3 } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-semibold text-slate-900">Reports</h1>
      <p class="text-sm text-slate-500">Business analytics and reports</p>
    </div>
    <div class="grid grid-cols-3 gap-4">
      <div
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <h3 class="text-sm font-semibold text-slate-800">Sales Report</h3>
        <p class="text-xs text-slate-500 mt-1">Daily, weekly, monthly sales breakdown</p>
      </div>
      <div
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <h3 class="text-sm font-semibold text-slate-800">Profit & Loss</h3>
        <p class="text-xs text-slate-500 mt-1">Revenue minus costs and expenses</p>
      </div>
      <div
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <h3 class="text-sm font-semibold text-slate-800">Stock Report</h3>
        <p class="text-xs text-slate-500 mt-1">Current stock levels and valuation</p>
      </div>
      <div
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <h3 class="text-sm font-semibold text-slate-800">Customer Report</h3>
        <p class="text-xs text-slate-500 mt-1">Top customers and credit report</p>
      </div>
      <div
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <h3 class="text-sm font-semibold text-slate-800">Tax Report</h3>
        <p class="text-xs text-slate-500 mt-1">Tax collected and tax summary</p>
      </div>
      <div
        class="bg-white border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm cursor-pointer transition-all"
      >
        <h3 class="text-sm font-semibold text-slate-800">Expense Report</h3>
        <p class="text-xs text-slate-500 mt-1">Expense tracking by category</p>
      </div>
    </div>
    <div class="bg-white border border-slate-200 rounded-lg p-12 text-center">
      <BarChart3 class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-sm text-slate-500">Detailed reports with charts coming in Phase 3</p>
    </div>
  </div>
</template>
