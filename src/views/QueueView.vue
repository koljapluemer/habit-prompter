<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="navbar bg-base-100 rounded-box shadow-lg mb-6">
      <div class="navbar-start">
        <router-link to="/" class="btn btn-ghost btn-circle">
          <ArrowLeft class="h-6 w-6" />
        </router-link>
        <div class="flex items-center gap-3 ml-4">
          <Shuffle class="h-8 w-8 text-primary" />
          <h1 class="text-3xl font-bold text-primary">Random Queue</h1>
        </div>
      </div>
      <div class="navbar-end">
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

    <!-- Queue Items -->
    <div v-if="queueItems.length > 0" class="space-y-4">
      <div
        v-for="item in queueItems"
        :key="`${item.type}-${item.itemId}`"
        class="card shadow-xl transition-all duration-300"
        :class="{
          'bg-success text-success-content': item.completed,
          'bg-base-100': !item.completed
        }"
      >
        <div class="card-body">
          <div class="flex items-start gap-4">
            <div class="flex items-center justify-center w-12 h-12 rounded-full">
              <RotateCcw v-if="item.type === 'habit'" class="h-8 w-8 text-primary" />
              <Brain v-else-if="item.type === 'evaluate'" class="h-8 w-8 text-warning" />
              <CheckSquare v-else class="h-8 w-8 text-success" />
            </div>
            <div class="flex-1">
              <h3 class="card-title text-lg">
                {{ getItemTitle(item) }}
                <div class="badge badge-outline">{{ item.type }}</div>
              </h3>
              <p class="text-base-content/70 mb-3">{{ getItemDescription(item) }}</p>

              <!-- Habit/Evaluate specific info -->
              <div v-if="item.type === 'habit' || item.type === 'evaluate'" class="text-sm opacity-70 mb-3">
                Frequency: Every {{ getFrequency(item) }} day(s)
                <span v-if="getLastCompleted(item)">
                  • Last completed: {{ formatDate(getLastCompleted(item)) }}
                </span>
              </div>

              <!-- Action buttons -->
              <div class="card-actions">
                <button
                  v-if="!item.completed && getDoInstantly(item)"
                  @click="markCompleted(item)"
                  class="btn btn-primary btn-sm"
                >
                  <Check class="h-4 w-4" />
                  Complete Now
                </button>
                <button
                  v-if="!item.completed && !getDoInstantly(item)"
                  @click="scheduleItem(item)"
                  class="btn btn-secondary btn-sm"
                >
                  <Calendar class="h-4 w-4" />
                  Schedule
                </button>
                <button
                  v-if="!item.completed"
                  @click="skipItem(item)"
                  class="btn btn-ghost btn-sm"
                >
                  Skip
                </button>
              </div>
            </div>

            <!-- Completed checkmark -->
            <div v-if="item.completed" class="flex items-center justify-center w-8 h-8 rounded-full bg-success text-success-content">
              <Check class="h-5 w-5" />
            </div>
          </div>
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
            <router-link to="/manage/habits" class="btn btn-outline">
              <Plus class="h-4 w-4" />
              Add Habits
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Schedule Modal -->
    <dialog id="schedule-modal" class="modal" :class="{ 'modal-open': showScheduleModal }">
      <div class="modal-box">
        <h3 class="text-lg font-bold mb-4">Schedule Item</h3>
        <p class="mb-4">When would you like to be reminded about this?</p>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">Date</span>
          </label>
          <input
            v-model="scheduleDate"
            type="date"
            class="input input-bordered w-full"
            :min="new Date().toISOString().split('T')[0]"
          />
        </div>

        <div class="modal-action">
          <button @click="confirmSchedule" class="btn btn-primary">Schedule</button>
          <button @click="showScheduleModal = false" class="btn">Cancel</button>
        </div>
      </div>
    </dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { queueService, habitService, evaluateService, todoService } from '@/services/database'
import type { QueueItem, Habit, Evaluate, Todo } from '@/db'
import {
  ArrowLeft, Shuffle, RotateCw, RotateCcw, Brain, CheckSquare,
  Check, Calendar, PartyPopper, Plus
} from 'lucide-vue-next'

const queueItems = ref<Array<QueueItem & { item?: Habit | Evaluate | Todo }>>([])
const isGenerating = ref(false)
const hasItems = ref(false)
const showScheduleModal = ref(false)
const scheduleDate = ref('')
const itemToSchedule = ref<QueueItem & { item?: Habit | Evaluate | Todo } | null>(null)

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

const getItemDescription = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item) return ''
  return item.item.description
}

const getFrequency = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item || (item.type !== 'habit' && item.type !== 'evaluate')) return 0
  return (item.item as Habit | Evaluate).minFrequencyDays
}

const getLastCompleted = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item || (item.type !== 'habit' && item.type !== 'evaluate')) return null
  return (item.item as Habit | Evaluate).lastCompleted
}

const getDoInstantly = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  if (!item.item) return true
  if (item.type === 'habit') return (item.item as Habit).doInstantly
  if (item.type === 'evaluate') return (item.item as Evaluate).doInstantly
  if (item.type === 'todo') return (item.item as Todo).doInstantly
  return true
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
  } else if (item.type === 'evaluate') {
    await evaluateService.markCompleted(item.itemId)
  } else if (item.type === 'todo') {
    await todoService.markCompleted(item.itemId)
  }

  await loadQueue()
}

const scheduleItem = (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  itemToSchedule.value = item
  scheduleDate.value = new Date().toISOString().split('T')[0]
  showScheduleModal.value = true
}

const confirmSchedule = async () => {
  if (!itemToSchedule.value || !scheduleDate.value) return

  const scheduledDate = new Date(scheduleDate.value)
  await queueService.create({
    type: itemToSchedule.value.type,
    itemId: itemToSchedule.value.itemId,
    scheduledFor: scheduledDate,
    completed: false
  })

  await skipItem(itemToSchedule.value)
  showScheduleModal.value = false
  itemToSchedule.value = null
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