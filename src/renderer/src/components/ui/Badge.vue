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
  return ['badge', `badge-${props.variant}`, props.size === 'md' && 'badge-md']
    .filter(Boolean)
    .join(' ')
})

const dotClass = computed(() => {
  return `badge-dot badge-dot-${props.variant}`
})
</script>

<template>
  <span :class="badgeClass">
    <span v-if="dot" :class="dotClass"></span>
    <slot />
  </span>
</template>
