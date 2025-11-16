<template>
  <div class="screen">
    <p class="line">
      <span class="line-text">Entities</span>
    </p>

    <div v-if="entities.length > 0" class="input-block">
      <p class="line">
        <span class="line-text uppercase">search</span>
      </p>
      <div class="input-wrapper">
        <span class="prompt-symbol">&gt;</span>
        <input v-model="searchQuery" type="text" class="line-input" autocomplete="off" spellcheck="false" />
      </div>
    </div>

    <p v-if="entities.length === 0" class="line info">
      <span class="line-text uppercase">no entities stored. add one?</span>
    </p>

    <ul v-else class="action-list">
      <li v-for="entity in filteredEntities" :key="entity.id">
        <RouterLink :to="`/entities/${entity.id}`" class="list-entry">
          <span class="line-text">{{ getEntityText(entity) }}</span>
        </RouterLink>
      </li>
    </ul>

    <div class="button-row nav-row">
      <RouterLink to="/menu" class="terminal-button">menu</RouterLink>
      <RouterLink to="/entities/new" class="terminal-button">add entity</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { entityService } from '@/services/database'
import type { Entity } from '@/db'
import { getDisplayName } from '@/utils/entityRegistry'

const entities = ref<Entity[]>([])
const searchQuery = ref('')

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

const loadEntities = async () => {
  entities.value = await entityService.getAllEntities()
}

const filteredEntities = computed(() => {
  if (!searchQuery.value.trim()) {
    return entities.value
  }
  const query = searchQuery.value.toLowerCase()
  return entities.value.filter(entity => {
    const text = getEntityText(entity).toLowerCase()
    const type = getDisplayName(entity.type).toLowerCase()
    return text.includes(query) || type.includes(query)
  })
})

onMounted(async () => {
  await loadEntities()
})
</script>

<style scoped></style>
