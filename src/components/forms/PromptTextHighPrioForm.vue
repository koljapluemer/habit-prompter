<template>
  <div class="prompt-text-high-prio-form">
    <p class="line">
      <span class="line-text">PROMPT (HIGH PRIORITY - SHOWS DAILY)</span>
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
  submitLabel: 'create',
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
</style>
