<template>
  <div class="screen">
    <p v-if="currentEntity" class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">{{ getEntityText(currentEntity) }}</span>
    </p>

    <p v-else class="line">
      <span class="line-text uppercase">{{ statusMessage }}</span>
    </p>

    <div v-if="currentEntity" class="interaction">
      <component
        :is="getInteractionComponent(currentEntity.type)"
        :entity="currentEntity"
        @answer="handleAnswer"
      />
    </div>

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink to="/menu" class="terminal-button">menu</RouterLink>
      <RouterLink v-if="currentEntity" :to="`/entities/${currentEntity.id}`" class="terminal-button">view</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { entityService } from '@/services/database'
import type { Entity } from '@/db'
import { getInteractionComponent, recordEntityAnswer } from '@/utils/entityRegistry'

const currentEntity = ref<Entity | null>(null)
const queuePhase = ref<'high-prio' | 'prompts'>('high-prio')

// Queue state
const highPrioQueue = ref<Entity[]>([])
const promptsQueue = ref<Entity[]>([])

const isNarrow = ref(false)

const statusMessage = computed(() => {
  if (queuePhase.value === 'high-prio' && highPrioQueue.value.length === 0) {
    return 'no high-priority prompts for today'
  }
  if (queuePhase.value === 'prompts' && promptsQueue.value.length === 0) {
    return 'queue empty. all done for now!'
  }
  return 'loading...'
})

const getEntityText = (entity: Entity): string => {
  switch (entity.type) {
    case 'prompt-text':
    case 'prompt-text-high-prio':
      return entity.prompt
    case 'prompt-yes-no':
      return entity.question
  }
}

const loadQueue = async () => {
  const candidates = await entityService.getAllDueCandidates()

  // Phase 1: High-priority text prompts
  highPrioQueue.value = candidates.promptsTextHighPrio

  // Phase 2: Other prompts (text and yes/no)
  promptsQueue.value = [...candidates.promptsText, ...candidates.promptsYesOrNo]

  // Reset state
  queuePhase.value = 'high-prio'

  pickNextEntity()
}

const pickNextEntity = () => {
  // Phase 1: Show all high-priority prompts first
  if (queuePhase.value === 'high-prio') {
    if (highPrioQueue.value.length > 0) {
      currentEntity.value = highPrioQueue.value[0]
      return
    }
    // Move to phase 2
    queuePhase.value = 'prompts'
  }

  // Phase 2: Infinite loop through other prompts
  if (queuePhase.value === 'prompts') {
    if (promptsQueue.value.length > 0) {
      currentEntity.value = promptsQueue.value[0]
      return
    }
  }

  // Nothing left
  currentEntity.value = null
}

const handleAnswer = async (answer: any) => {
  if (!currentEntity.value) return

  // Build the answer object based on entity type
  let answerObj: any

  if (currentEntity.value.type === 'prompt-text' || currentEntity.value.type === 'prompt-text-high-prio') {
    answerObj = {
      timestamp: new Date(),
      text: answer
    }
  } else if (currentEntity.value.type === 'prompt-yes-no') {
    answerObj = {
      timestamp: new Date(),
      value: answer
    }
  }

  // Record the answer
  await recordEntityAnswer(currentEntity.value, answerObj)

  // Remove from appropriate queue
  if (queuePhase.value === 'high-prio') {
    highPrioQueue.value = highPrioQueue.value.filter(e => e.id !== currentEntity.value!.id)
  } else if (queuePhase.value === 'prompts') {
    promptsQueue.value = promptsQueue.value.filter(e => e.id !== currentEntity.value!.id)
  }

  // Pick next
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
