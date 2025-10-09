<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Actions</span>
    </p>

    <p v-if="actions.length === 0" class="line info">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">No actions stored. Add one?</span>
    </p>

    <ul v-else class="action-list">
      <li v-for="action in actions" :key="action.id">
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
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { actionService, type Action } from '@/services/database'

const actions = ref<Action[]>([])

const loadActions = async () => {
  actions.value = await actionService.getActive()
}

onMounted(async () => {
  await loadActions()
})
</script>
