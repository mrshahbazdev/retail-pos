<script setup lang="ts">
import {
  Store,
  Palette,
  Receipt,
  Shield,
  Database,
  Printer,
  Users,
  Globe,
  Barcode,
  Bell,
  type LucideIcon
} from 'lucide-vue-next'

interface SettingsGroup {
  icon: LucideIcon
  label: string
  description: string
  color: string
}

const settingsGroups: SettingsGroup[] = [
  {
    icon: Store,
    label: 'Business Profile',
    description: 'Business name, address, contact info',
    color: 'bg-blue-50 text-blue-600'
  },
  {
    icon: Palette,
    label: 'Appearance',
    description: 'Theme, colors, layout preferences',
    color: 'bg-purple-50 text-purple-600'
  },
  {
    icon: Receipt,
    label: 'Receipt / Invoice',
    description: 'Receipt layout, header, footer, logo',
    color: 'bg-green-50 text-green-600'
  },
  {
    icon: Users,
    label: 'Staff & Roles',
    description: 'Manage users, roles, permissions',
    color: 'bg-orange-50 text-orange-600'
  },
  {
    icon: Shield,
    label: 'Security',
    description: 'Password policy, PIN settings, auto-lock',
    color: 'bg-red-50 text-red-600'
  },
  {
    icon: Barcode,
    label: 'Barcode / Scanner',
    description: 'Scanner settings, barcode format',
    color: 'bg-cyan-50 text-cyan-600'
  },
  {
    icon: Printer,
    label: 'Printer',
    description: 'Receipt printer, label printer setup',
    color: 'bg-amber-50 text-amber-600'
  },
  {
    icon: Globe,
    label: 'Language & Region',
    description: 'Language, currency, date format',
    color: 'bg-indigo-50 text-indigo-600'
  },
  {
    icon: Database,
    label: 'Backup & Data',
    description: 'Backup, restore, export data',
    color: 'bg-teal-50 text-teal-600'
  },
  {
    icon: Bell,
    label: 'Notifications',
    description: 'Low stock alerts, reminders',
    color: 'bg-pink-50 text-pink-600'
  }
]
</script>

<template>
  <div class="space-y-5">
    <div>
      <h1 class="text-xl font-bold text-slate-900">Settings</h1>
      <p class="text-[13px] text-slate-500 mt-0.5">Configure your POS system</p>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div
        v-for="group in settingsGroups"
        :key="group.label"
        class="bg-white border border-slate-200 rounded-lg p-4 flex items-start gap-4 hover:border-blue-200 hover:shadow-sm cursor-pointer transition-all duration-150"
      >
        <div
          class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
          :class="group.color"
        >
          <component :is="group.icon" class="w-5 h-5" />
        </div>
        <div>
          <h3 class="text-[13px] font-semibold text-slate-800">{{ group.label }}</h3>
          <p class="text-[11px] text-slate-400 mt-0.5">{{ group.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
