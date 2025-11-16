<template>
  <div class="task-buttons">
    <button @click="emit('answer', 'already-done')">Already Done</button>
    <button @click="emit('answer', 'ok')">OK</button>
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
  justify-content: center;
}

button {
  flex: 1;
  min-width: 0;
}
</style>
