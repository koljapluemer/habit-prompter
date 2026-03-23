<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Prompt Details</span>
    </p>

    <template v-if="entity">
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Prompt: {{ entity.prompt }}</span>
      </p>

      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Interval: every {{ entity.interval }} day(s)</span>
      </p>

      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Created: {{ formatDate(entity.createdAt) }}</span>
      </p>

      <p class="line" v-if="entity.lastShownAt">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Last Shown: {{ formatDate(entity.lastShownAt) }}</span>
      </p>

      <p class="line" v-if="entity.answers.length > 0">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Answers: {{ entity.answers.length }} recorded</span>
      </p>
    </template>

    <p v-else class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Prompt not found.</span>
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
import type { Prompt } from '@/db'
import { promptService } from '@/services/database'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const entity = ref<Prompt | undefined>()
const isNarrow = ref(false)

const loadEntity = async () => {
  entity.value = await promptService.getById(props.id)
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
  const confirmed = window.confirm('Delete this prompt?')
  if (!confirmed) return
  await promptService.delete(entity.value.id!)
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
