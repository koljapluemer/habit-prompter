<template>
  <div class="screen">
    <p class="line">
      <span class="line-text uppercase">task of the day</span>
    </p>

    <div v-if="loading" class="line">
      <span class="line-text uppercase">loading...</span>
    </div>

    <div v-else-if="isCompleted" class="line">
      <span class="line-text uppercase">today's task completed</span>
    </div>

    <div v-else-if="!task" class="line">
      <span class="line-text uppercase">no daily task available today</span>
    </div>

    <div v-else>
      <p class="line">
        <span class="line-text">{{ getEntityText(task) }}</span>
      </p>

      <div class="interaction">
        <component
          :is="getInteractionComponent(task.type)"
          :entity="task"
          @answer="handleAnswer"
        />
      </div>
    </div>

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink to="/menu" class="terminal-button">menu</RouterLink>
      <RouterLink v-if="task" :to="`/entities/${task.id}`" class="terminal-button">view details</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import type { Entity } from '@/db'
import { getCurrentTaskOfTheDay, markTaskCompleted } from '@/services/taskOfTheDay'
import { getInteractionComponent, recordEntityAnswer } from '@/utils/entityRegistry'

const task = ref<Entity | null>(null)
const isCompleted = ref(false)
const loading = ref(true)
const isNarrow = ref(false)

const getEntityText = (entity: Entity): string => {
  switch (entity.type) {
    case 'prompt-text':
    case 'prompt-text-high-prio':
      return entity.prompt
    case 'prompt-yes-no':
      return entity.question
    case 'daily-task-once':
    case 'daily-task-once-delayed-until':
    case 'daily-task-once-delayed-by-days':
    case 'daily-task-repeated':
    case 'daily-task-repeated-delayed-until':
    case 'daily-task-repeated-delayed-by-days':
      return entity.content
  }
}

const loadTask = async () => {
  loading.value = true
  const result = await getCurrentTaskOfTheDay()
  task.value = result.task
  isCompleted.value = result.isCompleted
  loading.value = false
}

const handleAnswer = async (answer: any) => {
  if (!task.value) return

  // Build the answer object
  const answerObj = {
    timestamp: new Date(),
    action: answer
  }

  // Record the answer
  await recordEntityAnswer(task.value, answerObj)

  // Mark as completed
  await markTaskCompleted()
  isCompleted.value = true
}

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  await loadTask()
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
