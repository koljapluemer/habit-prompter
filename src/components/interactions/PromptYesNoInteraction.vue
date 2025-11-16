<template>
  <div class="prompt-yes-no-interaction">
    <YesNoButtons @answer="handleAnswer" />
  </div>
</template>

<script setup lang="ts">
import type { PromptYesOrNo } from '@/db'
import YesNoButtons from '../YesNoButtons.vue'

interface Props {
  entity: PromptYesOrNo
}

interface Emits {
  (e: 'answer', value: 'yes' | 'kind-of' | 'no'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const handleAnswer = (value: 'yes' | 'kind-of' | 'no') => {
  emit('answer', value)
}
</script>

<style scoped>
.prompt-yes-no-interaction {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
</style>
