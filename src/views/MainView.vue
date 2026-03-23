<template>
  <div class="screen">
    <p v-if="currentEntity" class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">{{ currentEntity.prompt }}</span>
    </p>

    <p v-else class="line">
      <span class="line-text uppercase">{{ statusMessage }}</span>
    </p>

    <div v-if="currentEntity" class="interaction">
      <PromptTextInteraction
        :entity="currentEntity"
        @answer="handleAnswer"
      />
    </div>

    <div v-if="currentEntity" class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink :to="`/entities/${currentEntity.id}`" class="terminal-button">view</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Prompt } from '@/db'
import { promptService } from '@/services/database'
import PromptTextInteraction from '@/components/interactions/PromptTextInteraction.vue'

const currentEntity = ref<Prompt | null>(null)
const queue = ref<Prompt[]>([])
const isNarrow = ref(false)

const statusMessage = computed(() => {
  return queue.value.length === 0 ? 'queue empty. all done for now!' : 'loading...'
})

const loadQueue = async () => {
  queue.value = await promptService.getDueCandidates()
  pickNextEntity()
}

const pickNextEntity = () => {
  currentEntity.value = queue.value[0] ?? null
}

const handleAnswer = async (answer: string) => {
  if (!currentEntity.value) return
  const id = currentEntity.value.id!

  await promptService.recordAnswer(id, {
    timestamp: new Date(),
    text: answer
  })

  queue.value = queue.value.filter(e => e.id !== id)
  pickNextEntity()
}

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  await loadQueue()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.interaction {
  margin-top: 2rem;
}

.nav-row {
  margin-top: 2rem;
}
</style>
