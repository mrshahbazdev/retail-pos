<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@renderer/stores/auth.store'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Truck,
  ShoppingBag,
  Receipt,
  BarChart3,
  Wallet,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Store
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const collapsed = ref(false)

const navItems = computed(() => [
  { icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard', key: 'dashboard' },
  { icon: ShoppingCart, label: 'POS Terminal', route: '/pos', key: 'pos' },
  { icon: Package, label: 'Products', route: '/products', key: 'products' },
  { icon: Users, label: 'Customers', route: '/customers', key: 'customers' },
  { icon: Truck, label: 'Suppliers', route: '/suppliers', key: 'suppliers' },
  { icon: ShoppingBag, label: 'Purchases', route: '/purchases', key: 'purchases' },
  { icon: Receipt, label: 'Sales', route: '/sales', key: 'sales' },
  { icon: Wallet, label: 'Expenses', route: '/expenses', key: 'expenses' },
  { icon: BarChart3, label: 'Reports', route: '/reports', key: 'reports' },
  { icon: Settings, label: 'Settings', route: '/settings', key: 'settings' }
])

function isActive(path: string): boolean {
  return route.path.startsWith(path)
}

function navigate(path: string): void {
  router.push(path)
}

function logout(): void {
  authStore.clearAuth()
  router.push('/login')
}
</script>

<template>
  <aside
    class="h-full flex flex-col border-r border-slate-200 bg-white transition-all duration-200"
    :class="collapsed ? 'w-[68px]' : 'w-[240px]'"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-4 h-16 border-b border-slate-200">
      <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
        <Store class="w-5 h-5 text-white" />
      </div>
      <div v-if="!collapsed" class="flex flex-col overflow-hidden">
        <span class="text-sm font-semibold text-slate-900 truncate">
          {{ authStore.business?.name || 'RetailPOS' }}
        </span>
        <span class="text-xs text-slate-500 truncate capitalize">
          {{ authStore.business?.businessType || 'retail' }}
        </span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
      <button
        v-for="item in navItems"
        :key="item.key"
        class="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-100"
        :class="
          isActive(item.route)
            ? 'bg-blue-50 text-blue-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        "
        @click="navigate(item.route)"
      >
        <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
      </button>
    </nav>

    <!-- Bottom -->
    <div class="border-t border-slate-200 p-2 space-y-1">
      <button
        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
        @click="collapsed = !collapsed"
      >
        <ChevronLeft v-if="!collapsed" class="w-5 h-5 flex-shrink-0" />
        <ChevronRight v-else class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed">Collapse</span>
      </button>
      <button
        class="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        @click="logout"
      >
        <LogOut class="w-5 h-5 flex-shrink-0" />
        <span v-if="!collapsed">Logout</span>
      </button>
    </div>
  </aside>
</template>
