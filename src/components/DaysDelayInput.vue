<template>
  <div class="days-delay-input">
    <label v-if="label">{{ label }}</label>
    <input
      type="number"
      :value="modelValue"
      @input="handleInput"
      min="0"
      :placeholder="placeholder"
    />
    <span class="hint">days from now</span>
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
  placeholder: 'Enter number of days'
})

const emit = defineEmits<Emits>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value, 10)
  if (!isNaN(value) && value >= 0) {
    emit('update:modelValue', value)
  }
}
</script>

<style scoped>
.days-delay-input {
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
