import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface User {
  id: number
  businessId: number
  name: string
  username: string
  role: string
  phone: string | null
  email: string | null
  avatarPath: string | null
  permissions: string | null
  isActive: number
}

interface Business {
  id: number
  name: string
  businessType: string
  ownerName: string | null
  phone: string | null
  address: string | null
  city: string | null
  country: string | null
  currencyCode: string
  currencySymbol: string
  taxName: string | null
  defaultTaxRate: number
  logoPath: string | null
  language: string
  theme: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const business = ref<Business | null>(null)
  const isAuthenticated = computed(() => !!user.value)
  const isOwner = computed(() => user.value?.role === 'owner')
  const isAdmin = computed(() => ['owner', 'admin'].includes(user.value?.role || ''))

  function setAuth(userData: User, businessData: Business): void {
    user.value = userData
    business.value = businessData
  }

  function clearAuth(): void {
    user.value = null
    business.value = null
  }

  function hasPermission(module: string, action: string): boolean {
    if (!user.value) return false
    if (user.value.role === 'owner') return true

    try {
      const perms = JSON.parse(user.value.permissions || '{}')
      if (perms.all) return true
      return !!perms[module]?.[action]
    } catch {
      return false
    }
  }

  return {
    user,
    business,
    isAuthenticated,
    isOwner,
    isAdmin,
    setAuth,
    clearAuth,
    hasPermission
  }
})
