<template>
  <div class="prompt-yes-no-form">
    <div class="field">
      <label>Question</label>
      <input
        v-model="formData.question"
        type="text"
        placeholder="Enter your yes/no question"
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
import type { PromptYesOrNo } from '@/db'
import IntervalInput from '../IntervalInput.vue'

interface Props {
  initialData?: Partial<PromptYesOrNo>
  submitLabel?: string
  showBack?: boolean
}

interface Emits {
  (e: 'submit', data: Omit<PromptYesOrNo, 'id' | 'type' | 'createdAt' | 'lastShownAt' | 'answers'>): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Create',
  showBack: true
})

const emit = defineEmits<Emits>()

const formData = reactive({
  question: props.initialData?.question || '',
  interval: props.initialData?.interval || 1
})

const isValid = computed(() => {
  return formData.question.trim().length >= 3 && formData.interval >= 1
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      question: formData.question.trim(),
      interval: formData.interval
    })
  }
}
</script>

<style scoped>
.prompt-yes-no-form {
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
