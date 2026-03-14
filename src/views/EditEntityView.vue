<template>
  <div class="screen" v-if="entity">
    <p class="line">
      <span class="line-text uppercase">edit prompt</span>
    </p>

    <PromptTextForm
      :initial-data="entity"
      @submit="handleSubmit"
      @back="router.back()"
      submit-label="update"
    />

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink :to="`/entities/${entity.id}`" class="terminal-button">cancel</RouterLink>
    </div>
  </div>

  <div v-else class="screen">
    <p class="line">
      <span class="line-text uppercase">entity not found</span>
    </p>
    <div class="button-row nav-row">
      <RouterLink to="/actions" class="terminal-button">back to list</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { Prompt } from '@/db'
import PromptTextForm from '@/components/forms/PromptTextForm.vue'
import { promptService } from '@/services/database'

const props = defineProps<{ id: string }>()

const router = useRouter()
const entity = ref<Prompt | null>(null)
const isNarrow = ref(false)

const handleSubmit = async (data: { prompt: string; interval: number }) => {
  if (!entity.value) return
  await promptService.update(entity.value.id!, data)
  router.push({ name: 'entity-detail', params: { id: entity.value.id } })
}

const loadEntity = async () => {
  entity.value = await promptService.getById(props.id) ?? null
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

<style scoped>
.nav-row {
  margin-top: 2rem;
}
</style>
