<script setup lang="ts">
import { ShoppingBag, Plus } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-slate-900">Purchases</h1>
        <p class="text-[13px] text-slate-500 mt-0.5">Track purchase orders from suppliers</p>
      </div>
      <button
        class="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-150 active:scale-[0.98] shadow-sm flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        New Purchase
      </button>
    </div>
    <div class="bg-white border border-slate-200 rounded-lg p-16 text-center">
      <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
        <ShoppingBag class="w-8 h-8 text-slate-300" />
      </div>
      <p class="text-sm font-medium text-slate-500">Purchase Management</p>
      <p class="text-xs text-slate-400 mt-1">Coming in Phase 2</p>
    </div>
  </div>
</template>
