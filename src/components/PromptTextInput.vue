<template>
  <div class="prompt-text-input">
    <div class="input-wrapper">
      <span class="prompt-symbol">&gt;</span>
      <input
        v-model="text"
        type="text"
        class="line-input"
        @keydown.enter="handleSubmit"
        autocomplete="off"
        spellcheck="false"
      />
    </div>
    <button
      class="terminal-button"
      :disabled="!text.trim()"
      @click="handleSubmit"
    >
      submit
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
</style>
