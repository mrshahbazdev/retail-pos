<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Search, Bell, Moon, Sun } from 'lucide-vue-next'

const authStore = useAuthStore()
const searchQuery = ref('')
const isDark = ref(false)

function toggleTheme(): void {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}
</script>

<template>
  <header class="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6">
    <!-- Search -->
    <div class="flex items-center gap-3 flex-1 max-w-lg">
      <div class="relative w-full">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products, customers, invoices... (Ctrl+K)"
          class="w-full h-9 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-300"
        />
      </div>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-2">
      <!-- Theme toggle -->
      <button
        class="w-9 h-9 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
        @click="toggleTheme"
      >
        <Moon v-if="!isDark" class="w-4.5 h-4.5" />
        <Sun v-else class="w-4.5 h-4.5" />
      </button>

      <!-- Notifications -->
      <button
        class="relative w-9 h-9 rounded-md flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
      >
        <Bell class="w-4.5 h-4.5" />
        <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      <!-- User -->
      <div class="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
        <div class="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <span class="text-xs font-medium text-white">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-medium text-slate-700">
            {{ authStore.user?.name || 'User' }}
          </span>
          <span class="text-xs text-slate-500 capitalize">
            {{ authStore.user?.role || 'cashier' }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
