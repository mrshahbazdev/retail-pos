<script setup lang="ts">
import { Lock } from 'lucide-vue-next'
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Cash Register</h1>
      <p class="text-[13px] text-slate-500 mt-0.5">Open/close register and manage cash flow</p>
    </div>
    <div class="bg-white border border-slate-200 rounded-lg p-16 text-center">
      <div class="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
        <Lock class="w-8 h-8 text-slate-300" />
      </div>
      <p class="text-sm font-medium text-slate-500">Register Management</p>
      <p class="text-xs text-slate-400 mt-1">Coming in Phase 2</p>
    </div>
  </div>
</template>
