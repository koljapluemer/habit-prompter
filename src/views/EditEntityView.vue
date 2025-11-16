<template>
  <div class="screen" v-if="entity">
    <p class="line">
      <span class="line-text uppercase">edit {{ getDisplayName(entity.type) }}</span>
    </p>

    <component
      :is="getFormComponent(entity.type)"
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
import type { Entity } from '@/db'
import { getFormComponent, getEntityService, getDisplayName } from '@/utils/entityRegistry'

const props = defineProps<{ id: string }>()

const router = useRouter()
const entity = ref<Entity | null>(null)
const isNarrow = ref(false)

const handleSubmit = async (data: any) => {
  if (!entity.value) return

  const service = getEntityService(entity.value.type)
  await service.update(entity.value.id!, data)

  router.push({ name: 'entity-detail', params: { id: entity.value.id } })
}

const loadEntity = async () => {
  // We need to check all services to find the entity
  // For now, we'll use a helper that tries each service
  const { entityService } = await import('@/services/database')
  const allEntities = await entityService.getAllEntities()
  entity.value = allEntities.find(e => e.id === props.id) ?? null
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
