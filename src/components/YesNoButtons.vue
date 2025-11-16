<template>
  <div class="yes-no-buttons">
    <button @click="emit('answer', 'no')">No</button>
    <button @click="emit('answer', 'kind-of')">Kind Of</button>
    <button @click="emit('answer', 'yes')">Yes</button>
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
  justify-content: center;
}

button {
  flex: 1;
  min-width: 0;
}
</style>
