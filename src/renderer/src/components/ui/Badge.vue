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

const badgeClass = computed(() => {
  const variantMap: Record<string, string> = {
    default: 'badge-secondary',
    success: 'badge-success',
    danger: 'badge-danger',
    warning: 'badge-warning',
    info: 'badge-info'
  }
  return ['badge', variantMap[props.variant], props.size === 'md' && 'px-3 py-1']
    .filter(Boolean)
    .join(' ')
})

const dotColor = computed(() => {
  const map: Record<string, string> = {
    default: '#94a3b8',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#06b6d4'
  }
  return map[props.variant]
})
</script>

<template>
  <span :class="badgeClass">
    <span
      v-if="dot"
      class="d-inline-block rounded-circle"
      :style="{ width: '6px', height: '6px', backgroundColor: dotColor }"
    ></span>
    <slot />
  </span>
</template>
