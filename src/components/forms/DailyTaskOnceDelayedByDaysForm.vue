<template>
  <div class="daily-task-once-delayed-by-days-form">
    <div class="field">
      <label>Task Content</label>
      <input
        v-model="formData.content"
        type="text"
        placeholder="Enter task content"
        minlength="3"
      />
    </div>

    <DaysDelayInput
      v-model="formData.startInDays"
      label="Start in (days)"
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
import type { DailyTaskOnceDelayedByDays } from '@/db'
import DaysDelayInput from '../DaysDelayInput.vue'

interface Props {
  initialData?: Partial<DailyTaskOnceDelayedByDays>
  submitLabel?: string
  showBack?: boolean
}

interface Emits {
  (e: 'submit', data: Omit<DailyTaskOnceDelayedByDays, 'id' | 'type' | 'createdAt' | 'lastShownAt' | 'answers' | 'isDone'>): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Create',
  showBack: true
})

const emit = defineEmits<Emits>()

const formData = reactive({
  content: props.initialData?.content || '',
  startInDays: props.initialData?.startInDays || 0
})

const isValid = computed(() => {
  return formData.content.trim().length >= 3 && formData.startInDays >= 0
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      content: formData.content.trim(),
      startInDays: formData.startInDays
    })
  }
}
</script>

<style scoped>
.daily-task-once-delayed-by-days-form {
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
