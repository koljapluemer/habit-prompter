<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Action Details</span>
    </p>

    <template v-if="action">
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Content: {{ action.content }}</span>
      </p>
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Modality: {{ action.modality }}</span>
      </p>
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Interval: every {{ action.intervalDays }} day(s)</span>
      </p>
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">High Priority: {{ action.isHighPrio ? 'Yes' : 'No' }}</span>
      </p>
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Finishable: {{ action.isFinishable ? 'Yes' : 'No' }}</span>
      </p>
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Completed: {{ action.isCompleted ? 'Yes' : 'No' }}</span>
      </p>
      <p class="line" v-if="action.lastCompleted">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Last Interaction: {{ formatDate(action.lastCompleted) }}</span>
      </p>
      <p class="line" v-if="action.completedAt">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Finished At: {{ formatDate(action.completedAt) }}</span>
      </p>
    </template>
    <p v-else class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Action not found.</span>
    </p>

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <button class="terminal-button" @click="goBack">Back</button>
      <button v-if="action" class="terminal-button" @click="goEdit">Edit</button>
      <button v-if="action" class="terminal-button" @click="remove">Delete</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { actionService, type Action } from '@/services/database'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const action = ref<Action | undefined>()
const isNarrow = ref(false)

const loadAction = async () => {
  action.value = await actionService.getById(props.id)
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
  router.push({ name: 'edit-action', params: { id: props.id } })
}

const remove = async () => {
  if (!action.value) return
  const confirmed = window.confirm('Delete this action?')
  if (!confirmed) return
  await actionService.delete(action.value.id!)
  router.push({ name: 'list' })
}

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  await loadAction()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
