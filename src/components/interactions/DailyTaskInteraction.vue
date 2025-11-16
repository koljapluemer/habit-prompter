<template>
  <div class="daily-task-interaction">
    <TaskButtons @answer="handleAnswer" />
  </div>
</template>

<script setup lang="ts">
import type { DailyTaskOnce, DailyTaskOnceDelayedUntil, DailyTaskOnceDelayedByDays, DailyTaskRepeated, DailyTaskRepeatedDelayedUntil, DailyTaskRepeatedDelayedByDays } from '@/db'
import TaskButtons from '../TaskButtons.vue'

type DailyTask =
  | DailyTaskOnce
  | DailyTaskOnceDelayedUntil
  | DailyTaskOnceDelayedByDays
  | DailyTaskRepeated
  | DailyTaskRepeatedDelayedUntil
  | DailyTaskRepeatedDelayedByDays

interface Props {
  entity: DailyTask
}

interface Emits {
  (e: 'answer', action: 'ok' | 'already-done'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleAnswer = (action: 'ok' | 'already-done') => {
  emit('answer', action)
}
</script>

<style scoped>
.daily-task-interaction {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
