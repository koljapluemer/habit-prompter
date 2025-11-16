<template>
  <div class="prompt-text-form">
    <p class="line">
      <span class="line-text uppercase">prompt</span>
    </p>
    <div class="input-wrapper">
      <span class="prompt-symbol">&gt;</span>
      <input
        v-model="formData.prompt"
        type="text"
        class="line-input"
        autocomplete="off"
        spellcheck="false"
        minlength="3"
      />
    </div>

    <IntervalInput
      v-model="formData.interval"
      label="interval (days)"
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
  submitLabel: 'create',
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
</style>
