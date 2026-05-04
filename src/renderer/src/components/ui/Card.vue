<script setup lang="ts">
interface Props {
  padding?: boolean
}

withDefaults(defineProps<Props>(), {
  padding: true
})
</script>

<template>
  <div class="bg-white border border-slate-200 rounded-lg" :class="padding && 'p-5'">
    <slot />
  </div>
</template>
