<template>
  <div class="prompt-text-input">
    <textarea
      v-model="text"
      :placeholder="placeholder"
      @input="handleInput"
      rows="4"
    />
    <button
      :disabled="!text.trim()"
      @click="handleSubmit"
    >
      Submit
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  placeholder?: string
}

interface Emits {
  (e: 'submit', text: string): void
}

withDefaults(defineProps<Props>(), {
  placeholder: 'Enter your answer...'
})

const emit = defineEmits<Emits>()

const text = ref('')

const handleInput = () => {
  // Auto-resize could be added here if needed
}

const handleSubmit = () => {
  if (text.value.trim()) {
    emit('submit', text.value.trim())
    text.value = ''
  }
}
</script>

<style scoped>
.prompt-text-input {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

textarea {
  width: 100%;
  padding: 0.5rem;
  font-family: inherit;
  font-size: inherit;
  resize: vertical;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
