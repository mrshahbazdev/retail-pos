<script setup lang="ts">
interface Props {
  modelValue?: string | number
  label?: string
  placeholder?: string
  type?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
}

withDefaults(defineProps<Props>(), {
  type: 'text',
  disabled: false,
  required: false
})

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-slate-700">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      class="h-9 px-3 bg-white border rounded-lg text-sm text-slate-700 placeholder:text-slate-400"
      :class="
        error ? 'border-red-300 focus:border-red-500' : 'border-slate-300 focus:border-blue-400'
      "
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <p v-if="error" class="text-xs text-red-600 flex items-center gap-1">{{ error }}</p>
    <p v-else-if="hint" class="text-[11px] text-slate-400">{{ hint }}</p>
  </div>
</template>
