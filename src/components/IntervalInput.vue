<template>
  <div class="interval-input">
    <label v-if="label">{{ label }}</label>
    <input
      type="number"
      :value="modelValue"
      @input="handleInput"
      min="1"
      :placeholder="placeholder"
    />
    <span class="hint">days</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: number
  label?: string
  placeholder?: string
}

interface Emits {
  (e: 'update:modelValue', value: number): void
}

withDefaults(defineProps<Props>(), {
  label: '',
  placeholder: 'Enter interval in days'
})

const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value) && value >= 1) {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.interval-input {
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
</style>
