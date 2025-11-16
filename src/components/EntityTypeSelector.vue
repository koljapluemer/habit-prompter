<template>
  <div class="entity-type-selector">
    <div class="grid">
      <button v-for="type in entityTypes" :key="type.value" @click="emit('select', type.value)" class="type-button">
        <div class="type-name">{{ type.label }}</div>
        <div class="type-description">{{ type.description }}</div>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { EntityType } from '@/db'

interface Emits {
  (e: 'select', type: EntityType): void
}

const emit = defineEmits<Emits>()

const entityTypes = [
  {
    value: 'prompt-text' as EntityType,
    label: 'Prompt: Text',
    description: 'Regular text prompt with interval'
  },
  {
    value: 'prompt-text-high-prio' as EntityType,
    label: 'Prompt: Text (High Priority)',
    description: 'Daily high-priority text prompt'
  },
  {
    value: 'prompt-yes-no' as EntityType,
    label: 'Prompt: Yes/No',
    description: 'Yes/No/Kind-of question with interval'
  },
  {
    value: 'daily-task-once' as EntityType,
    label: 'Daily Task: Once',
    description: 'One-time task'
  },
  {
    value: 'daily-task-once-delayed-until' as EntityType,
    label: 'Daily Task: Once (Delayed Until)',
    description: 'One-time task starting on a specific date'
  },
  {
    value: 'daily-task-once-delayed-by-days' as EntityType,
    label: 'Daily Task: Once (Delayed By Days)',
    description: 'One-time task starting after N days'
  },
  {
    value: 'daily-task-repeated' as EntityType,
    label: 'Daily Task: Repeated',
    description: 'Recurring task with interval'
  },
  {
    value: 'daily-task-repeated-delayed-until' as EntityType,
    label: 'Daily Task: Repeated (Delayed Until)',
    description: 'Recurring task starting on a specific date'
  },
  {
    value: 'daily-task-repeated-delayed-by-days' as EntityType,
    label: 'Daily Task: Repeated (Delayed By Days)',
    description: 'Recurring task starting after N days'
  }
]
</script>

<style scoped>
.entity-type-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

h2 {
  margin: 0;
  text-align: center;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.type-button {
  padding: 1rem;
  text-align: left;
  cursor: pointer;
  border: 2px solid currentColor;
  background: transparent;
  color: inherit;
  font-family: inherit;
  transition: background-color 0.2s;
}

.type-button:hover {
  background-color: rgba(0, 255, 0, 0.1);
}

.type-name {
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.type-description {
  font-size: 0.9em;
  opacity: 0.8;
}
</style>
