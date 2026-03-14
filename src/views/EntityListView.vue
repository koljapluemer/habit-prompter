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
          <span class="line-text">{{ entity.prompt }}</span>
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
import type { Prompt } from '@/db'
import { promptService } from '@/services/database'

const entities = ref<Prompt[]>([])
const searchQuery = ref('')

const loadEntities = async () => {
  entities.value = await promptService.getAll()
}

const filteredEntities = computed(() => {
  if (!searchQuery.value.trim()) return entities.value
  const query = searchQuery.value.toLowerCase()
  return entities.value.filter(entity => entity.prompt.toLowerCase().includes(query))
})

onMounted(async () => {
  await loadEntities()
})
</script>
