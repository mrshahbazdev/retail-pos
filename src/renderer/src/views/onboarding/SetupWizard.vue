<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@renderer/stores/auth.store'
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Pill,
  Utensils,
  Scissors,
  Wrench,
  BookOpen,
  Gem,
  Car,
  Shirt,
  Apple,
  Monitor,
  Footprints,
  CakeSlice,
  Glasses,
  Dumbbell,
  Palette,
  Gamepad2,
  Package
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const totalSteps = 4
const loading = ref(false)
const error = ref('')

// Business data
const businessName = ref('')
const businessType = ref('retail')
const ownerName = ref('')
const phone = ref('')
const address = ref('')
const city = ref('')
const country = ref('Pakistan')
const currencyCode = ref('PKR')
const currencySymbol = ref('₨')
const taxName = ref('Sales Tax')
const defaultTaxRate = ref(0)
const language = ref('en')

// Admin data
const adminName = ref('')
const adminUsername = ref('')
const adminPassword = ref('')
const adminConfirmPassword = ref('')
const adminPin = ref('')

const businessTypes = [
  {
    value: 'retail',
    label: 'General Retail',
    icon: ShoppingCart,
    color: 'bg-blue-50 text-blue-600'
  },
  {
    value: 'grocery',
    label: 'Grocery / Supermarket',
    icon: Apple,
    color: 'bg-green-50 text-green-600'
  },
  {
    value: 'clothing',
    label: 'Clothing / Fashion',
    icon: Shirt,
    color: 'bg-purple-50 text-purple-600'
  },
  {
    value: 'electronics',
    label: 'Electronics / Mobile',
    icon: Monitor,
    color: 'bg-cyan-50 text-cyan-600'
  },
  { value: 'pharmacy', label: 'Pharmacy / Medical', icon: Pill, color: 'bg-red-50 text-red-600' },
  {
    value: 'restaurant',
    label: 'Restaurant / Cafe',
    icon: Utensils,
    color: 'bg-orange-50 text-orange-600'
  },
  {
    value: 'salon',
    label: 'Salon / Barbershop',
    icon: Scissors,
    color: 'bg-pink-50 text-pink-600'
  },
  {
    value: 'hardware',
    label: 'Hardware / Building',
    icon: Wrench,
    color: 'bg-amber-50 text-amber-600'
  },
  {
    value: 'bookshop',
    label: 'Bookshop / Stationery',
    icon: BookOpen,
    color: 'bg-indigo-50 text-indigo-600'
  },
  { value: 'jewelry', label: 'Jewelry Store', icon: Gem, color: 'bg-yellow-50 text-yellow-600' },
  { value: 'auto_parts', label: 'Auto Parts', icon: Car, color: 'bg-slate-50 text-slate-600' },
  { value: 'shoes', label: 'Shoe Store', icon: Footprints, color: 'bg-teal-50 text-teal-600' },
  { value: 'bakery', label: 'Bakery / Sweets', icon: CakeSlice, color: 'bg-rose-50 text-rose-600' },
  { value: 'optical', label: 'Optical / Eyewear', icon: Glasses, color: 'bg-sky-50 text-sky-600' },
  {
    value: 'cosmetics',
    label: 'Cosmetics / Beauty',
    icon: Palette,
    color: 'bg-fuchsia-50 text-fuchsia-600'
  },
  { value: 'sports', label: 'Sports / Fitness', icon: Dumbbell, color: 'bg-lime-50 text-lime-600' },
  { value: 'toys', label: 'Toy Store', icon: Gamepad2, color: 'bg-violet-50 text-violet-600' },
  { value: 'custom', label: 'Custom / Other', icon: Package, color: 'bg-gray-50 text-gray-600' }
]

const canProceed = computed(() => {
  switch (step.value) {
    case 1:
      return businessName.value.trim() && businessType.value
    case 2:
      return ownerName.value.trim()
    case 3:
      return (
        adminName.value.trim() &&
        adminUsername.value.trim() &&
        adminPassword.value.length >= 4 &&
        adminPassword.value === adminConfirmPassword.value
      )
    default:
      return true
  }
})

async function completeSetup(): Promise<void> {
  loading.value = true
  error.value = ''
  try {
    const result = await window.electron.ipcRenderer.invoke(
      'auth:setup',
      {
        name: businessName.value,
        businessType: businessType.value,
        ownerName: ownerName.value,
        phone: phone.value,
        address: address.value,
        city: city.value,
        country: country.value,
        currencyCode: currencyCode.value,
        currencySymbol: currencySymbol.value,
        taxName: taxName.value,
        defaultTaxRate: defaultTaxRate.value,
        language: language.value
      },
      {
        name: adminName.value,
        username: adminUsername.value,
        password: adminPassword.value,
        pin: adminPin.value
      }
    )

    if (result.success) {
      authStore.setAuth(result.user, result.business)
      step.value = 4
    } else {
      error.value = result.error || 'Setup failed'
    }
  } catch {
    error.value = 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

function goToDashboard(): void {
  router.push('/dashboard')
}
</script>

<template>
  <div class="h-screen w-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-2xl">
      <!-- Progress -->
      <div class="flex items-center justify-center gap-2 mb-8">
        <template v-for="s in totalSteps" :key="s">
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200"
            :class="
              s < step
                ? 'bg-blue-600 text-white'
                : s === step
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-500'
            "
          >
            <CheckCircle v-if="s < step" class="w-5 h-5" />
            <span v-else>{{ s }}</span>
          </div>
          <div
            v-if="s < totalSteps"
            class="w-12 h-0.5 transition-all duration-200"
            :class="s < step ? 'bg-blue-600' : 'bg-slate-200'"
          />
        </template>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <!-- Step 1: Business Type & Name -->
        <div v-if="step === 1" class="p-8">
          <h1 class="text-xl font-semibold text-slate-900 mb-1">Welcome to RetailPOS</h1>
          <p class="text-sm text-slate-500 mb-6">
            Select your business type and enter your business name.
          </p>

          <div class="mb-6">
            <label class="text-sm font-medium text-slate-700 mb-2 block">Business Name *</label>
            <input
              v-model="businessName"
              type="text"
              placeholder="e.g., Shahbaz Electronics"
              class="w-full h-10 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
            />
          </div>

          <label class="text-sm font-medium text-slate-700 mb-3 block">Business Type *</label>
          <div class="grid grid-cols-3 gap-2 max-h-[320px] overflow-y-auto">
            <button
              v-for="bt in businessTypes"
              :key="bt.value"
              class="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all duration-150 text-center"
              :class="
                businessType === bt.value
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-slate-200 hover:border-slate-300'
              "
              @click="businessType = bt.value"
            >
              <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="bt.color">
                <component :is="bt.icon" class="w-5 h-5" />
              </div>
              <span class="text-xs font-medium text-slate-700">{{ bt.label }}</span>
            </button>
          </div>
        </div>

        <!-- Step 2: Business Details -->
        <div v-if="step === 2" class="p-8">
          <h1 class="text-xl font-semibold text-slate-900 mb-1">Business Details</h1>
          <p class="text-sm text-slate-500 mb-6">
            Enter your business information for receipts and invoices.
          </p>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Owner Name *</label>
              <input
                v-model="ownerName"
                type="text"
                placeholder="Full name"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Phone</label>
              <input
                v-model="phone"
                type="tel"
                placeholder="03XX-XXXXXXX"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div class="col-span-2">
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Address</label>
              <input
                v-model="address"
                type="text"
                placeholder="Shop address"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">City</label>
              <input
                v-model="city"
                type="text"
                placeholder="City"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Country</label>
              <input
                v-model="country"
                type="text"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Currency</label>
              <div class="flex gap-2">
                <input
                  v-model="currencyCode"
                  type="text"
                  placeholder="PKR"
                  class="w-20 h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
                />
                <input
                  v-model="currencySymbol"
                  type="text"
                  placeholder="₨"
                  class="w-16 h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
                />
              </div>
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block"
                >Default Tax Rate (%)</label
              >
              <input
                v-model.number="defaultTaxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
          </div>
        </div>

        <!-- Step 3: Admin Account -->
        <div v-if="step === 3" class="p-8">
          <h1 class="text-xl font-semibold text-slate-900 mb-1">Create Admin Account</h1>
          <p class="text-sm text-slate-500 mb-6">Set up your administrator login credentials.</p>

          <div class="grid grid-cols-2 gap-4">
            <div class="col-span-2">
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Full Name *</label>
              <input
                v-model="adminName"
                type="text"
                placeholder="Admin name"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div class="col-span-2">
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Username *</label>
              <input
                v-model="adminUsername"
                type="text"
                placeholder="admin"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block">Password *</label>
              <input
                v-model="adminPassword"
                type="password"
                placeholder="Min 4 characters"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-slate-700 mb-1.5 block"
                >Confirm Password *</label
              >
              <input
                v-model="adminConfirmPassword"
                type="password"
                placeholder="Repeat password"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
            </div>
            <div class="col-span-2">
              <label class="text-sm font-medium text-slate-700 mb-1.5 block"
                >Quick PIN (Optional)</label
              >
              <input
                v-model="adminPin"
                type="text"
                maxlength="6"
                placeholder="4-6 digit PIN for quick login"
                class="w-full h-9 px-3 border border-slate-300 rounded-md text-sm focus:border-blue-400"
              />
              <p class="text-xs text-slate-400 mt-1">
                Used for quick cashier login without typing full password.
              </p>
            </div>
          </div>

          <p v-if="error" class="text-sm text-red-600 mt-4">{{ error }}</p>
        </div>

        <!-- Step 4: Complete -->
        <div v-if="step === 4" class="p-8 text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 rounded-full bg-green-50 flex items-center justify-center"
          >
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <h1 class="text-xl font-semibold text-slate-900 mb-2">Setup Complete!</h1>
          <p class="text-sm text-slate-500 mb-6">
            Your {{ businessName }} POS system is ready. Start adding products and making sales.
          </p>
          <button class="btn-primary h-10 px-6" @click="goToDashboard">Go to Dashboard</button>
        </div>

        <!-- Footer Navigation -->
        <div
          v-if="step < 4"
          class="flex items-center justify-between px-8 py-4 bg-slate-50 border-t border-slate-200"
        >
          <button
            v-if="step > 1"
            class="flex items-center gap-1 h-9 px-4 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            @click="step--"
          >
            <ChevronLeft class="w-4 h-4" />
            Back
          </button>
          <div v-else />

          <button
            v-if="step < 3"
            :disabled="!canProceed"
            class="btn-primary h-9 px-5 text-sm"
            @click="step++"
          >
            Continue
            <ChevronRight class="w-4 h-4" />
          </button>

          <button
            v-if="step === 3"
            :disabled="!canProceed || loading"
            class="btn-primary h-9 px-5 text-sm"
            @click="completeSetup"
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
            Complete Setup
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
