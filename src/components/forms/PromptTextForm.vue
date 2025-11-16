<template>
  <div class="prompt-text-form">
    <div class="field">
      <label>Prompt</label>
      <input
        v-model="formData.prompt"
        type="text"
        placeholder="Enter your prompt"
        minlength="3"
      />
    </div>

    <IntervalInput
      v-model="formData.interval"
      label="Interval (days)"
    />

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
import type { PromptText } from '@/db'
import IntervalInput from '../IntervalInput.vue'

interface Props {
  initialData?: Partial<PromptText>
  submitLabel?: string
  showBack?: boolean
}

interface Emits {
  (e: 'submit', data: Omit<PromptText, 'id' | 'type' | 'createdAt' | 'lastShownAt' | 'answers'>): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Create',
  showBack: true
})

const emit = defineEmits<Emits>()

const formData = reactive({
  prompt: props.initialData?.prompt || '',
  interval: props.initialData?.interval || 1
})

const isValid = computed(() => {
  return formData.prompt.trim().length >= 3 && formData.interval >= 1
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      prompt: formData.prompt.trim(),
      interval: formData.interval
    })
  }
}
</script>

<style scoped>
.prompt-text-form {
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
