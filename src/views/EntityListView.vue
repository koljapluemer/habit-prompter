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

    <div v-if="entities.length > 0" class="filter-block">
      <p class="line">
        <span class="line-text uppercase">filter by type</span>
      </p>
      <div class="checkbox-list">
        <label v-for="type in allEntityTypes" :key="type" class="checkbox-item">
          <span class="checkbox-indicator">{{ selectedTypes.has(type) ? '[x]' : '[ ]' }}</span>
          <input
            type="checkbox"
            :checked="selectedTypes.has(type)"
            @change="toggleType(type)"
            class="checkbox-hidden"
          />
          <span class="checkbox-label">{{ getDisplayName(type) }}</span>
        </label>
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
import type { Entity, EntityType } from '@/db'
import { getDisplayName, ENTITY_REGISTRY } from '@/utils/entityRegistry'

const entities = ref<Entity[]>([])
const searchQuery = ref('')

const allEntityTypes = Object.keys(ENTITY_REGISTRY) as EntityType[]
const selectedTypes = ref<Set<EntityType>>(new Set(allEntityTypes))

const toggleType = (type: EntityType) => {
  if (selectedTypes.value.has(type)) {
    selectedTypes.value.delete(type)
  } else {
    selectedTypes.value.add(type)
  }
  selectedTypes.value = new Set(selectedTypes.value)
}

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
  let result = entities.value

  if (selectedTypes.value.size < allEntityTypes.length) {
    result = result.filter(entity => selectedTypes.value.has(entity.type))
  }

  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(entity => {
      const text = getEntityText(entity).toLowerCase()
      const type = getDisplayName(entity.type).toLowerCase()
      return text.includes(query) || type.includes(query)
    })
  }

  return result
})

onMounted(async () => {
  await loadEntities()
})
</script>

<style scoped>
.filter-block {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.checkbox-item:hover .checkbox-indicator,
.checkbox-item:hover .checkbox-label {
  text-decoration: underline;
}

.checkbox-hidden {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-indicator {
  font-family: inherit;
}

.checkbox-label {
  text-transform: uppercase;
}
</style>
