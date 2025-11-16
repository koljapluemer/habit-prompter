<template>
  <div class="date-input">
    <p v-if="label" class="line">
      <span class="line-text">{{ label }} (YY-MM-DD)</span>
    </p>
    <div class="input-wrapper">
      <span class="prompt-symbol">&gt;</span>
      <input
        type="text"
        :value="modelValue"
        @input="handleInput"
        class="line-input"
        pattern="\d{2}-\d{2}-\d{2}"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <p v-if="error" class="line">
      <span class="line-text">{{ error }}</span>
    </p>
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
    error.value = 'USE FORMAT YY-MM-DD'
    return false
  }

  const parts = value.split('-')
  const year = parseInt(parts[0], 10) + 2000
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)

  if (month < 1 || month > 12) {
    error.value = 'MONTH MUST BE 01-12'
    return false
  }

  if (day < 1 || day > 31) {
    error.value = 'DAY MUST BE 01-31'
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
</style>
