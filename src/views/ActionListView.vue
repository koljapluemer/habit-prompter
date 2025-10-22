<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Actions</span>
    </p>

    <div v-if="actions.length > 0" class="line search-line">
      <label class="line-text">Search</label>
      <input
        v-model="searchQuery"
        type="text"
        class="terminal-input"
        placeholder="filter actions..."
      />
    </div>

    <p v-if="actions.length === 0" class="line info">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">No actions stored. Add one?</span>
    </p>

    <ul v-else class="action-list">
      <li v-for="action in filteredActions" :key="action.id">
        <RouterLink :to="`/actions/${action.id}`" class="list-entry">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">{{ action.content }}</span>
          <span v-if="action.isHighPrio" class="flag">HIGH</span>
          <span v-if="action.isFinishable" class="flag">FINISHABLE</span>
        </RouterLink>
      </li>
    </ul>

    <div class="button-row nav-row">
      <RouterLink to="/menu" class="terminal-button">Menu</RouterLink>
      <RouterLink to="/actions/new" class="terminal-button">Add Action</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { actionService, type Action } from '@/services/database'

const actions = ref<Action[]>([])
const searchQuery = ref('')

const loadActions = async () => {
  actions.value = await actionService.getActive()
}

const filteredActions = computed(() => {
  if (!searchQuery.value.trim()) {
    return actions.value
  }
  const query = searchQuery.value.toLowerCase()
  return actions.value.filter(action =>
    action.content.toLowerCase().includes(query)
  )
})

onMounted(async () => {
  await loadActions()
})
</script>
