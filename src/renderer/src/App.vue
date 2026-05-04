<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(async () => {
  try {
    const result = await window.electron.ipcRenderer.invoke('auth:check-setup')
    if (!result.isSetup) {
      router.replace('/setup')
    } else {
      router.replace('/login')
    }
  } catch {
    router.replace('/setup')
  }
})
</script>

<template>
  <router-view />
</template>
