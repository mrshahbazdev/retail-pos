<script setup lang="ts">
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

interface Props {
  label: string
  value: string | number
  trend?: number
  icon?: object
  iconColor?: string
}

defineProps<Props>()
</script>

<template>
  <div
    class="bg-white border border-slate-200 rounded-lg p-5 transition-all duration-150 hover:border-slate-300"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-[13px] font-medium text-slate-500">{{ label }}</span>
      <div
        v-if="icon"
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        :class="iconColor || 'bg-blue-50 text-blue-600'"
      >
        <component :is="icon" class="w-[18px] h-[18px]" />
      </div>
    </div>
    <div class="text-2xl font-bold text-slate-900 tracking-tight">
      {{ value }}
    </div>
    <div v-if="trend !== undefined" class="flex items-center gap-1.5 mt-2">
      <div
        class="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
        :class="trend >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'"
      >
        <TrendingUp v-if="trend >= 0" class="w-3 h-3" />
        <TrendingDown v-else class="w-3 h-3" />
        {{ Math.abs(trend) }}%
      </div>
      <span class="text-[11px] text-slate-400">vs last period</span>
    </div>
  </div>
</template>
