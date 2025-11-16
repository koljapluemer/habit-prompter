<template>
  <div class="daily-task-once-form">
    <div class="field">
      <label>Task Content</label>
      <input
        v-model="formData.content"
        type="text"
        placeholder="Enter task content"
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
import type { DailyTaskOnce } from '@/db'

interface Props {
  initialData?: Partial<DailyTaskOnce>
  submitLabel?: string
  showBack?: boolean
}

interface Emits {
  (e: 'submit', data: Omit<DailyTaskOnce, 'id' | 'type' | 'createdAt' | 'lastShownAt' | 'answers' | 'isDone'>): void
  (e: 'back'): void
}

const props = withDefaults(defineProps<Props>(), {
  submitLabel: 'Create',
  showBack: true
})

const emit = defineEmits<Emits>()

const formData = reactive({
  content: props.initialData?.content || ''
})

const isValid = computed(() => {
  return formData.content.trim().length >= 3
})

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit', {
      content: formData.content.trim()
    })
  }
}
</script>

<style scoped>
.daily-task-once-form {
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
