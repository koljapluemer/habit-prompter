<template>
  <div class="screen">
    <p class="line">
      <span class="line-text">ADD ENTITY</span>
    </p>

    <div v-if="step === 1">
      <EntityTypeSelector @select="handleTypeSelect" />
    </div>

    <div v-else-if="step === 2 && selectedType">
      <p class="line">
        <span class="line-text">{{ getDisplayName(selectedType) }}</span>
      </p>
      <component
        :is="getFormComponent(selectedType)"
        @submit="handleSubmit"
        @back="step = 1"
        submit-label="create"
      />
    </div>

    <div v-if="step === 1" class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink to="/menu" class="terminal-button">cancel</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import type { EntityType } from '@/db'
import EntityTypeSelector from '@/components/EntityTypeSelector.vue'
import { getFormComponent, getEntityService, getDisplayName } from '@/utils/entityRegistry'

const router = useRouter()
const step = ref(1)
const selectedType = ref<EntityType | null>(null)
const isNarrow = ref(false)

const handleTypeSelect = (type: EntityType) => {
  selectedType.value = type
  step.value = 2
}

const handleSubmit = async (data: any) => {
  if (!selectedType.value) return

  const service = getEntityService(selectedType.value)

  // Build the complete entity
  const entity = {
    type: selectedType.value,
    ...data,
    createdAt: new Date(),
    lastShownAt: undefined,
    answers: []
  }

  // Add isDone for daily tasks that need it
  if (selectedType.value.startsWith('daily-task-once')) {
    (entity as any).isDone = false
  }

  await service.create(entity)
  router.push('/actions')
}

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
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
