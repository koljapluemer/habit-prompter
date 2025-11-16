<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Entity Details</span>
    </p>

    <template v-if="entity">
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Type: {{ getDisplayName(entity.type) }}</span>
      </p>

      <!-- Common content field -->
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">{{ getContentLabel(entity) }}: {{ getEntityText(entity) }}</span>
      </p>

      <!-- Type-specific fields -->
      <template v-if="'interval' in entity">
        <p class="line">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">Interval: every {{ entity.interval }} day(s)</span>
        </p>
      </template>

      <template v-if="'isDone' in entity">
        <p class="line">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">Done: {{ entity.isDone ? 'Yes' : 'No' }}</span>
        </p>
      </template>

      <template v-if="'startAtDate' in entity">
        <p class="line">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">Start Date: {{ entity.startAtDate }}</span>
        </p>
      </template>

      <template v-if="'startInDays' in entity">
        <p class="line">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">Start In: {{ entity.startInDays }} day(s)</span>
        </p>
      </template>

      <!-- Common timestamps -->
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Created: {{ formatDate(entity.createdAt) }}</span>
      </p>

      <p class="line" v-if="entity.lastShownAt">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Last Shown: {{ formatDate(entity.lastShownAt) }}</span>
      </p>

      <!-- Answers history -->
      <p class="line" v-if="entity.answers.length > 0">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Answers: {{ entity.answers.length }} recorded</span>
      </p>
    </template>

    <p v-else class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Entity not found.</span>
    </p>

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <button class="terminal-button" @click="goBack">Back</button>
      <button v-if="entity" class="terminal-button" @click="goEdit">Edit</button>
      <button v-if="entity" class="terminal-button" @click="remove">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { entityService } from '@/services/database'
import type { Entity } from '@/db'
import { getDisplayName } from '@/utils/entityRegistry'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const entity = ref<Entity | undefined>()
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

const getContentLabel = (entity: Entity): string => {
  switch (entity.type) {
    case 'prompt-text':
    case 'prompt-text-high-prio':
      return 'Prompt'
    case 'prompt-yes-no':
      return 'Question'
    case 'daily-task-once':
    case 'daily-task-once-delayed-until':
    case 'daily-task-once-delayed-by-days':
    case 'daily-task-repeated':
    case 'daily-task-repeated-delayed-until':
    case 'daily-task-repeated-delayed-by-days':
      return 'Content'
  }
}

const loadEntity = async () => {
  const allEntities = await entityService.getAllEntities()
  entity.value = allEntities.find(e => e.id === props.id)
}

const formatDate = (input: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(input))
}

const goBack = () => {
  router.back()
}

const goEdit = () => {
  router.push({ name: 'edit-entity', params: { id: props.id } })
}

const remove = async () => {
  if (!entity.value) return
  const confirmed = window.confirm('Delete this entity?')
  if (!confirmed) return
  await entityService.deleteEntity(entity.value)
  router.push({ name: 'entity-list' })
}

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  await loadEntity()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
