<template>
  <div class="date-input">
    <label v-if="label">{{ label }}</label>
    <input
      type="text"
      :value="modelValue"
      @input="handleInput"
      :placeholder="placeholder"
      pattern="\d{2}-\d{2}-\d{2}"
    />
    <span class="hint">Format: yy-mm-dd (e.g., 25-12-31)</span>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  modelValue: string
  label?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'yy-mm-dd'
})

const emit = defineEmits<Emits>()

const error = ref('')

const validateDate = (value: string): boolean => {
  const regex = /^\d{2}-\d{2}-\d{2}$/
  if (!regex.test(value)) {
    error.value = 'Use format yy-mm-dd'
    return false
  }

  const parts = value.split('-')
  const year = parseInt(parts[0], 10) + 2000
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  if (month < 1 || month > 12) {
    error.value = 'Month must be 01-12'
    return false
  }

  if (day < 1 || day > 31) {
    error.value = 'Day must be 01-31'
    return false
  }

  error.value = ''
  return true
}

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = target.value
  emit('update:modelValue', value)
  if (value) {
    validateDate(value)
  } else {
    error.value = ''
  }
}

watch(() => props.modelValue, (value) => {
  if (value) {
    validateDate(value)
  }
})
</script>

<style scoped>
.date-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: bold;
}

input {
  padding: 0.5rem;
  font-family: inherit;
  font-size: inherit;
}

.hint {
  font-size: 0.9em;
  opacity: 0.7;
}

.error {
  color: #ff4444;
  font-size: 0.9em;
}
</style>
