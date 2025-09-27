<template>
  <div>
    <!-- Queue header with refresh button -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <Shuffle class="h-8 w-8 text-primary" />
        <h2 class="text-2xl font-bold">Random Queue</h2>
      </div>
      <button
        @click="generateQueue"
        :disabled="isGenerating"
        class="btn btn-secondary btn-sm"
      >
        <span v-if="isGenerating" class="loading loading-spinner"></span>
        <RotateCw v-else class="h-4 w-4" />
        {{ isGenerating ? 'Generating...' : 'Refresh Queue' }}
      </button>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between text-sm mb-2">
        <span>Progress</span>
        <span>{{ completedCount }} / {{ totalCount }}</span>
      </div>
      <progress
        class="progress progress-primary w-full"
        :value="completedCount"
        :max="totalCount"
      ></progress>
    </div>

    <!-- Current Queue Item -->
    <div v-if="currentItem" class="card bg-base-100 shadow-xl">
      <div class="card-body text-center">
        <div class="flex justify-center mb-4">
          <div class="flex items-center justify-center w-16 h-16 rounded-full bg-base-200">
            <RotateCcw v-if="currentItem.type === 'habit'" class="h-10 w-10 text-primary" />
            <Brain v-else-if="currentItem.type === 'evaluate'" class="h-10 w-10 text-warning" />
            <CheckSquare v-else class="h-10 w-10 text-success" />
          </div>
        </div>

        <h2 class="card-title text-2xl justify-center mb-3">{{ getItemTitle(currentItem) }}</h2>

        <!-- Habit/Evaluate frequency info -->
        <div v-if="currentItem.type === 'habit' || currentItem.type === 'evaluate'" class="text-sm opacity-70 mb-6">
          Every {{ getFrequency(currentItem) }} day(s)
          <span v-if="getLastCompleted(currentItem)" class="block mt-1">
            Last completed: {{ formatDate(getLastCompleted(currentItem)) }}
          </span>
        </div>

        <!-- Evaluation text input -->
        <div v-if="currentItem.type === 'evaluate'" class="form-control w-full max-w-lg mx-auto mb-6">
          <label class="label">
            <span class="label-text">Your thoughts:</span>
          </label>
          <textarea
            v-model="evaluationResponse"
            class="textarea textarea-bordered w-full"
            placeholder="Reflect on this question..."
            rows="4"
            required
          ></textarea>
        </div>

        <!-- Action buttons -->
        <div class="card-actions justify-center gap-4">
          <!-- Habits: Done / Not Today -->
          <template v-if="currentItem.type === 'habit'">
            <button @click="markCompleted(currentItem)" class="btn btn-primary">
              <Check class="h-4 w-4" />
              Done
            </button>
            <button @click="skipItem(currentItem)" class="btn btn-outline">
              Not Today
            </button>
          </template>

          <!-- Todos: Finished / Made Progress / Not Today -->
          <template v-else-if="currentItem.type === 'todo'">
            <button @click="markCompleted(currentItem)" class="btn btn-success">
              <Check class="h-4 w-4" />
              Finished
            </button>
            <button @click="markProgress(currentItem)" class="btn btn-info">
              <ArrowRight class="h-4 w-4" />
              Made Progress
            </button>
            <button @click="skipItem(currentItem)" class="btn btn-outline">
              Not Today
            </button>
          </template>

          <!-- Evaluations: Done (only when text is not empty) -->
          <template v-else-if="currentItem.type === 'evaluate'">
            <button
              @click="completeEvaluation(currentItem)"
              :disabled="!evaluationResponse.trim()"
              class="btn btn-warning"
              :class="{ 'btn-disabled': !evaluationResponse.trim() }"
            >
              <Check class="h-4 w-4" />
              Done
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Empty Queue State -->
    <div v-else class="hero bg-base-200 rounded-box min-h-96">
      <div class="hero-content text-center">
        <div>
          <PartyPopper class="h-16 w-16 mx-auto mb-4 text-success" />
          <h2 class="text-2xl font-bold mb-4">Your queue is empty!</h2>
          <p class="text-base-content/70 mb-6">
            {{ hasItems ? 'Great job completing everything!' : 'Add some habits, evaluations, or todos to get started.' }}
          </p>
          <div class="flex gap-3 justify-center">
            <button
              v-if="hasItems"
              @click="generateQueue"
              :disabled="isGenerating"
              class="btn btn-primary"
            >
              Generate New Queue
            </button>
            <router-link to="/habits" class="btn btn-outline">
              <Plus class="h-4 w-4" />
              Add Habits
            </router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { queueService, habitService, evaluateService, todoService } from '@/services/database'
import type { QueueItem, Habit, Evaluate, Todo } from '@/db'
import {
  Shuffle, RotateCw, RotateCcw, Brain, CheckSquare,
  Check, PartyPopper, Plus, ArrowRight
} from 'lucide-vue-next'

const queueItems = ref<Array<QueueItem & { item?: Habit | Evaluate | Todo }>>([])
const currentItem = ref<QueueItem & { item?: Habit | Evaluate | Todo } | null>(null)
const evaluationResponse = ref('')
const isGenerating = ref(false)
const hasItems = ref(false)

const completedCount = ref(0)
const totalCount = ref(0)

const loadQueue = async () => {
  const items = await queueService.getForDate(new Date())
  const itemsWithData = await Promise.all(
    items.map(async (queueItem) => {
      let item
      if (queueItem.type === 'habit') {
        const habits = await habitService.getAll()
        item = habits.find(h => h.id === queueItem.itemId)
      } else if (queueItem.type === 'evaluate') {
        const evaluates = await evaluateService.getAll()
        item = evaluates.find(e => e.id === queueItem.itemId)
      } else if (queueItem.type === 'todo') {
        const todos = await todoService.getAll()
        item = todos.find(t => t.id === queueItem.itemId)
      }
      return { ...queueItem, item }
    })
  )

  queueItems.value = itemsWithData.filter(item => item.item)

  completedCount.value = queueItems.value.filter(item => item.completed).length
  totalCount.value = queueItems.value.length

  // Set current item to first uncompleted item
  currentItem.value = queueItems.value.find(item => !item.completed) || null

  // Clear evaluation response when switching items
  evaluationResponse.value = ''
}

const checkHasItems = async () => {
  const [habits, evaluates, todos] = await Promise.all([
    habitService.getAll(),
    evaluateService.getAll(),
    todoService.getActive()
  ])
  hasItems.value = habits.length > 0 || evaluates.length > 0 || todos.length > 0
}

const generateQueue = async () => {
  isGenerating.value = true
  try {
    const saved = localStorage.getItem('habit-tracker-queue-size')
    const queueSize = saved ? parseInt(saved) : 8
    await queueService.generateQueueForDate(new Date(), queueSize)
    await loadQueue()
  } catch (error) {
    console.error('Failed to generate queue:', error)
  }
  isGenerating.value = false
}

const getItemTitle = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item) return 'Unknown item'
  if (item.type === 'habit') return (item.item as Habit).title
  if (item.type === 'evaluate') return (item.item as Evaluate).question
  if (item.type === 'todo') return (item.item as Todo).title
  return 'Unknown item'
}


const getFrequency = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item || (item.type !== 'habit' && item.type !== 'evaluate')) return 0
  return (item.item as Habit | Evaluate).minFrequencyDays
}

const getLastCompleted = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item || (item.type !== 'habit' && item.type !== 'evaluate')) return null
  return (item.item as Habit | Evaluate).lastCompleted
}


const formatDate = (date: Date | null | undefined) => {
  if (!date) return 'Never'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date))
}

const markCompleted = async (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  await queueService.markCompleted(item.id!)

  if (item.type === 'habit') {
    await habitService.markCompleted(item.itemId)
  } else if (item.type === 'todo') {
    await todoService.markCompleted(item.itemId)
  }

  await loadQueue()
}

const markProgress = async (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  // Just skip the item for now - could add progress tracking later
  await skipItem(item)
}

const completeEvaluation = async (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!evaluationResponse.value.trim()) return

  await queueService.markCompleted(item.id!, evaluationResponse.value)
  await evaluateService.markCompleted(item.itemId)

  await loadQueue()
}

const skipItem = async (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  await queueService.delete(item.id!)
  await loadQueue()
}

onMounted(async () => {
  await checkHasItems()
  await loadQueue()

  if (queueItems.value.length === 0 && hasItems.value) {
    await generateQueue()
  }
})
</script>