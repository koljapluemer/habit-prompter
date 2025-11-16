<template>
  <div class="prompt-text-interaction">
    <PromptTextInput @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import type { PromptText } from '@/db'
import PromptTextInput from '../PromptTextInput.vue'

interface Props {
  entity: PromptText
}

interface Emits {
  (e: 'answer', text: string): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleSubmit = (text: string) => {
  emit('answer', text)
}
</script>

<style scoped>
.prompt-text-interaction {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
