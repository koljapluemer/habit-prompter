<template>
  <div class="daily-task-repeated-delayed-until-form">
    <p class="line">
      <span class="line-text">TASK CONTENT</span>
    </p>
    <div class="input-wrapper">
      <span class="prompt-symbol">&gt;</span>
      <input
        v-model="formData.content"
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

    <DateInput
      v-model="formData.startAtDate"
      label="START DATE"
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
import type { DailyTaskRepeatedDelayedUntil } from '@/db'
import IntervalInput from '../IntervalInput.vue'
import DateInput from '../DateInput.vue'

interface Props {
  initialData?: Partial<DailyTaskRepeatedDelayedUntil>
  submitLabel?: string
  showBack?: boolean
}

interface Emits {
  (e: 'submit', data: Omit<DailyTaskRepeatedDelayedUntil, 'id' | 'type' | 'createdAt' | 'lastShownAt' | 'answers'>): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'create',
  showBack: true
})

const emit = defineEmits<Emits>()

const formData = reactive({
  content: props.initialData?.content || '',
  interval: props.initialData?.interval || 1,
  startAtDate: props.initialData?.startAtDate || ''
})

const isValid = computed(() => {
  return formData.content.trim().length >= 3 &&
         formData.interval >= 1 &&
         formData.startAtDate.match(/^\d{2}-\d{2}-\d{2}$/)
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      content: formData.content.trim(),
      interval: formData.interval,
      startAtDate: formData.startAtDate
    })
  }
}
</script>

<style scoped>
.daily-task-repeated-delayed-until-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
