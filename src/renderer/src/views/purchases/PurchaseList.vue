<script setup lang="ts">
import { ShoppingBag, Plus } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-semibold text-slate-900">Purchases</h1>
        <p class="text-sm text-slate-500">Track purchase orders from suppliers</p>
      </div>
      <button
        class="h-9 px-4 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 flex items-center gap-2"
      >
        <Plus class="w-4 h-4" />
        New Purchase
      </button>
    </div>
    <div class="bg-white border border-slate-200 rounded-lg p-12 text-center">
      <ShoppingBag class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <p class="text-sm text-slate-500">Purchase management coming in Phase 2</p>
    </div>
  </div>
</template>
