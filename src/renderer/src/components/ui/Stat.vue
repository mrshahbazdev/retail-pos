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
  <div class="bg-white border border-slate-200 rounded-lg p-5">
    <div class="flex items-center justify-between mb-3">
      <span class="text-sm font-medium text-slate-500">{{ label }}</span>
      <div
        v-if="icon"
        class="w-9 h-9 rounded-lg flex items-center justify-center"
        :class="iconColor || 'bg-blue-50 text-blue-600'"
      >
        <component :is="icon" class="w-5 h-5" />
      </div>
    </div>
    <div class="text-2xl font-semibold text-slate-900 tracking-tight">
      {{ value }}
    </div>
    <div v-if="trend !== undefined" class="flex items-center gap-1 mt-2">
      <TrendingUp v-if="trend >= 0" class="w-3.5 h-3.5 text-green-600" />
      <TrendingDown v-else class="w-3.5 h-3.5 text-red-600" />
      <span class="text-xs font-medium" :class="trend >= 0 ? 'text-green-600' : 'text-red-600'">
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-xs text-slate-400">vs last period</span>
    </div>
  </div>
</template>
