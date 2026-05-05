<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md'
  dot?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'sm',
  dot: false
})

const classes = computed(() => {
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-full'
  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs'
  }
  const variants = {
    default: 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200',
    success: 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-200',
    danger: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-200',
    warning: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
    info: 'bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-200'
  }
  const dotColors = {
    default: 'bg-slate-400',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-amber-500',
    info: 'bg-cyan-500'
  }

  return {
    badge: [base, sizes[props.size], variants[props.variant]].join(' '),
    dot: `w-1.5 h-1.5 rounded-full ${dotColors[props.variant]}`
  }
})
</script>

<template>
  <span :class="classes.badge">
    <span v-if="dot" :class="classes.dot"></span>
    <slot />
  </span>
</template>
