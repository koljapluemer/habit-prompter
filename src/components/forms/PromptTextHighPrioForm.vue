<template>
  <div class="prompt-text-high-prio-form">
    <div class="field">
      <label>Prompt (High Priority - shows daily)</label>
      <input
        v-model="formData.prompt"
        type="text"
        placeholder="Enter your prompt"
        minlength="3"
      />
    </div>

    <div class="actions">
      <button v-if="showBack" @click="emit('back')">Back</button>
      <button
        :disabled="!isValid"
        @click="handleSubmit"
      >
        {{ submitLabel }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import type { PromptTextHighPrio } from '@/db'

interface Props {
  initialData?: Partial<PromptTextHighPrio>
  submitLabel?: string
  showBack?: boolean
}

interface Emits {
  (e: 'submit', data: Omit<PromptTextHighPrio, 'id' | 'type' | 'createdAt' | 'lastShownAt' | 'answers'>): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Create',
  showBack: true
})

const emit = defineEmits<Emits>()

const formData = reactive({
  prompt: props.initialData?.prompt || ''
})

const isValid = computed(() => {
  return formData.prompt.trim().length >= 3
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      prompt: formData.prompt.trim()
    })
  }
}
</script>

<style scoped>
.prompt-text-high-prio-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field {
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

.actions {
  display: flex;
  gap: 1rem;
}

.actions button {
  flex: 1;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
