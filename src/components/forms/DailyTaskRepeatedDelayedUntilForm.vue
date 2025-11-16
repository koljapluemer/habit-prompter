<template>
  <div class="daily-task-repeated-delayed-until-form">
    <div class="field">
      <label>Task Content</label>
      <input
        v-model="formData.content"
        type="text"
        placeholder="Enter task content"
        minlength="3"
      />
    </div>

    <IntervalInput
      v-model="formData.interval"
      label="Interval (days)"
    />

    <DateInput
      v-model="formData.startAtDate"
      label="Start Date"
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
  submitLabel: 'Create',
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
