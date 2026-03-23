<template>
  <div class="screen">
    <p class="line">
      <span class="line-text uppercase">add prompt</span>
    </p>

    <PromptTextForm @submit="handleSubmit" submit-label="create" :show-back="false" />

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink to="/actions" class="terminal-button">cancel</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import PromptTextForm from '@/components/forms/PromptTextForm.vue'
import { promptService } from '@/services/database'

const router = useRouter()
const isNarrow = ref(false)

const handleSubmit = async (data: { prompt: string; interval: number }) => {
  await promptService.create({
    prompt: data.prompt,
    interval: data.interval,
    createdAt: new Date(),
    lastShownAt: undefined,
    answers: []
  })
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
