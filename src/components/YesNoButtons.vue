<template>
  <div class="yes-no-buttons">
    <button class="terminal-button" @click="emit('answer', 'no')">no</button>
    <button class="terminal-button" @click="emit('answer', 'kind-of')">kind of</button>
    <button class="terminal-button" @click="emit('answer', 'yes')">yes</button>
  </div>
</template>

<script setup lang="ts">
interface Emits {
  (e: 'answer', value: 'yes' | 'kind-of' | 'no'): void
}

const emit = defineEmits<Emits>()
</script>

<style scoped>
.yes-no-buttons {
  display: flex;
  gap: 1rem;
}

.terminal-button {
  flex: 1;
  min-width: 0;
}
</style>
