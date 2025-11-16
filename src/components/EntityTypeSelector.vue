<template>
  <div class="entity-type-selector">
    <div class="grid">
      <button v-for="type in entityTypes" :key="type.value" @click="emit('select', type.value)" class="terminal-button">
        {{ type.label }}
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
    label: 'prompt: text'
  },
  {
    value: 'prompt-text-high-prio' as EntityType,
    label: 'prompt: text (high priority)'
  },
  {
    value: 'prompt-yes-no' as EntityType,
    label: 'prompt: yes/no'
  },
  {
    value: 'daily-task-once' as EntityType,
    label: 'daily task: once'
  },
  {
    value: 'daily-task-once-delayed-until' as EntityType,
    label: 'daily task: once (delayed until)'
  },
  {
    value: 'daily-task-once-delayed-by-days' as EntityType,
    label: 'daily task: once (delayed by days)'
  },
  {
    value: 'daily-task-repeated' as EntityType,
    label: 'daily task: repeated'
  },
  {
    value: 'daily-task-repeated-delayed-until' as EntityType,
    label: 'daily task: repeated (delayed until)'
  },
  {
    value: 'daily-task-repeated-delayed-by-days' as EntityType,
    label: 'daily task: repeated (delayed by days)'
  }
]
</script>

<style scoped>
.entity-type-selector {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}
</style>
