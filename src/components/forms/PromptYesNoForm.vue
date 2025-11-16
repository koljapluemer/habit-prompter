<template>
  <div class="prompt-yes-no-form">
    <p class="line">
      <span class="line-text">QUESTION</span>
    </p>
    <div class="input-wrapper">
      <span class="prompt-symbol">&gt;</span>
      <input
        v-model="formData.question"
        type="text"
        class="line-input"
        autocomplete="off"
        spellcheck="false"
        minlength="3"
      />
    </div>

    <IntervalInput
      v-model="formData.interval"
      label="INTERVAL (DAYS)"
    />

    <div class="button-row">
      <button v-if="showBack" class="terminal-button" @click="emit('back')">back</button>
      <button
        class="terminal-button"
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
  submitLabel: 'create',
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
</style>
