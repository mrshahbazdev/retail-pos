<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@renderer/stores/auth.store'
import { Store, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function login(): Promise<void> {
  if (!username.value || !password.value) {
    error.value = 'Please enter username and password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await window.electron.ipcRenderer.invoke(
      'auth:login',
      username.value,
      password.value
    )
    if (result.success) {
      authStore.setAuth(result.user, result.business)
      router.push('/dashboard')
    } else {
      error.value = result.error
    }
  } catch {
    error.value = 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="h-screen w-screen bg-slate-50 flex items-center justify-center">
    <div class="w-full max-w-sm px-4">
      <!-- Logo -->
      <div class="flex flex-col items-center mb-8">
        <div
          class="d-flex align-items-center justify-content-center rounded-3 bg-primary text-white mb-4"
          style="width: 56px; height: 56px"
        >
          <Store class="w-7 h-7 text-white" />
        </div>
        <h1 class="text-xl font-bold text-slate-900">RetailPOS</h1>
        <p class="text-sm text-slate-500 mt-1">Sign in to your account</p>
      </div>

      <!-- Login Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-6">
        <form class="space-y-4" @submit.prevent="login">
          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Username</label>
            <input
              v-model="username"
              type="text"
              placeholder="Enter username"
              autofocus
              class="w-full h-10 px-3.5 border border-slate-300 rounded-lg text-sm focus:border-blue-400 bg-white"
            />
          </div>

          <div>
            <label class="text-[13px] font-medium text-slate-700 mb-1.5 block">Password</label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Enter password"
                class="w-full h-10 px-3.5 pr-10 border border-slate-300 rounded-lg text-sm focus:border-blue-400 bg-white"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                tabindex="-1"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            v-if="error"
            class="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-100 rounded-lg"
          >
            <p class="text-sm text-red-600">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="btn btn-primary w-full d-flex align-items-center justify-content-center gap-2"
            style="height: 40px"
          >
            <svg
              v-if="loading"
              class="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              />
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>

      <!-- Footer -->
      <p class="text-center text-[11px] text-slate-400 mt-6">
        RetailPOS v1.0 &mdash; Offline-first POS system
      </p>
    </div>
  </div>
</template>
