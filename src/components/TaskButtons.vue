<template>
  <div class="task-buttons">
    <button class="terminal-button" @click="emit('answer', 'already-done')">already done</button>
    <button class="terminal-button" @click="emit('answer', 'ok')">ok</button>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'answer', action: 'ok' | 'already-done'): void
}

const emit = defineEmits<Emits>()
</script>

<style scoped>
.task-buttons {
  display: flex;
  gap: 1rem;
}

.terminal-button {
  flex: 1;
  min-width: 0;
}
</style>
