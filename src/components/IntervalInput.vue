<template>
  <div class="interval-input">
    <p v-if="label" class="line">
      <span class="line-text uppercase">{{ label }}</span>
    </p>
    <div class="input-wrapper">
      <span class="prompt-symbol">&gt;</span>
      <input
        type="text"
        inputmode="numeric"
        :value="modelValue"
        @input="handleInput"
        class="line-input"
        autocomplete="off"
      />
    </div>
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
  placeholder: 'days'
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
</style>
