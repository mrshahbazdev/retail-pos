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
  <header
    class="h-14 border-b border-slate-200 bg-white flex items-center justify-between px-6 flex-shrink-0"
  >
    <!-- Search -->
    <div class="flex items-center gap-3 flex-1 max-w-lg">
      <div class="relative w-full group">
        <Search
          class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors"
        />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products, customers, invoices..."
          class="w-full h-9 pl-10 pr-20 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:bg-white focus:border-blue-300"
        />
        <kbd
          class="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white border border-slate-200 rounded"
        >
          Ctrl+K
        </kbd>
      </div>
    </div>

    <!-- Right side -->
    <div class="flex items-center gap-1.5">
      <!-- Theme toggle -->
      <button
        class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        @click="toggleTheme"
      >
        <Moon v-if="!isDark" class="w-4 h-4" />
        <Sun v-else class="w-4 h-4" />
      </button>

      <!-- Notifications -->
      <button
        class="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
      >
        <Bell class="w-4 h-4" />
        <span
          class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"
        />
      </button>

      <!-- User -->
      <div class="flex items-center gap-2.5 ml-2 pl-3 border-l border-slate-200">
        <div
          class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm"
        >
          <span class="text-xs font-semibold text-white">
            {{ authStore.user?.name?.charAt(0)?.toUpperCase() || 'U' }}
          </span>
        </div>
        <div class="flex flex-col">
          <span class="text-[13px] font-medium text-slate-700 leading-tight">
            {{ authStore.user?.name || 'User' }}
          </span>
          <span class="text-[11px] text-slate-400 capitalize leading-tight">
            {{ authStore.user?.role || 'cashier' }}
          </span>
        </div>
      </div>
    </div>
  </header>
</template>
