<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  fullWidth: false
})

const classes = computed(() => {
  const sizes = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg'
  }

  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-outline-secondary',
    ghost: 'btn-link text-slate-600',
    danger: 'btn-danger',
    success: 'btn-success'
  }

  return [
    'btn',
    sizes[props.size],
    variants[props.variant],
    props.fullWidth && 'w-100',
    'd-inline-flex align-items-center justify-content-center gap-2'
  ]
    .filter(Boolean)
    .join(' ')
})
</script>

<template>
  <button :class="classes" :disabled="disabled || loading">
    <svg
      v-if="loading"
      class="animate-spin h-4 w-4"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
    <slot />
  </button>
</template>
