<script setup lang="ts">
interface Props {
  padding?: boolean
  hoverable?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true,
  hoverable: false
})
</script>

<template>
  <div
    class="bg-white border border-slate-200 rounded-lg transition-all duration-150"
    :class="[padding && 'p-5', hoverable && 'hover:border-blue-200 cursor-pointer']"
  >
    <slot />
  </div>
</template>
