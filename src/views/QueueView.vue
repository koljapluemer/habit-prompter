<template>
  <div>
    <!-- Queue header -->
    <div class="flex justify-between items-center mb-6">
      <div class="flex items-center gap-3">
        <Shuffle class="h-8 w-8 text-primary" />
        <h2 class="text-2xl font-bold">Today's Queue</h2>
      </div>
      <div class="text-sm text-base-content/70">
        Daily limit: {{ dailyLimit }}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mb-6">
      <div class="flex justify-between text-sm mb-2">
        <span>Today's Progress</span>
        <span>{{ completedToday }} / {{ dailyLimit }}</span>
      </div>
      <progress
        class="progress progress-primary w-full"
        :value="completedToday"
        :max="dailyLimit"
      ></progress>
      <div v-if="availableItems.length < dailyLimit" class="text-xs text-warning mt-1">
        Only {{ availableItems.length }} items available ({{ dailyLimit - availableItems.length }} short of daily limit)
      </div>
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
              Not Now
            </button>
          </template>

          <!-- Todos: Finished / Made Progress / Not Today -->
          <template v-else-if="currentItem.type === 'todo'">
            <button @click="markCompleted(currentItem)" class="btn btn-success">
              <Check class="h-4 w-4" />
              Finished
            </button>
            <button @click="markProgress()" class="btn btn-info">
              <ArrowRight class="h-4 w-4" />
              Made Progress
            </button>
            <button @click="skipItem(currentItem)" class="btn btn-outline">
              Not Now
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
          <PartyPopper v-if="completedToday >= dailyLimit" class="h-16 w-16 mx-auto mb-4 text-success" />
          <CheckSquare v-else class="h-16 w-16 mx-auto mb-4 text-base-content/50" />

          <h2 v-if="completedToday >= dailyLimit" class="text-2xl font-bold mb-4">Daily limit reached!</h2>
          <h2 v-else-if="!hasItems" class="text-2xl font-bold mb-4">No items available!</h2>
          <h2 v-else class="text-2xl font-bold mb-4">Nothing due right now!</h2>

          <p v-if="completedToday >= dailyLimit" class="text-base-content/70 mb-6">
            Great job! You've completed {{ completedToday }} items today ({{ dailyLimit }} limit reached).
          </p>
          <p v-else-if="!hasItems" class="text-base-content/70 mb-6">
            Add some habits, evaluations, or todos to get started.
          </p>
          <p v-else class="text-base-content/70 mb-6">
            All your habits and evaluations are up to date, and no todos are pending.
          </p>

          <div class="flex gap-3 justify-center">
            <router-link to="/habits" class="btn btn-outline">
              <Plus class="h-4 w-4" />
              Add Habits
            </router-link>
            <router-link to="/eval" class="btn btn-outline">
              <Plus class="h-4 w-4" />
              Add Evaluations
            </router-link>
            <router-link to="/todos" class="btn btn-outline">
              <Plus class="h-4 w-4" />
              Add Todos
            </router-link>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { habitService, evaluateService, todoService } from '@/services/database'
import type { Habit, Evaluate, Todo } from '@/db'
import {
  Shuffle, RotateCcw, Brain, CheckSquare,
  Check, PartyPopper, Plus, ArrowRight
} from 'lucide-vue-next'

const currentItem = ref<{ type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo } | null>(null)
const evaluationResponse = ref('')
const completedToday = ref(0)
const dailyLimit = ref(0)
const availableItems = ref<Array<{ type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }>>([])
const hasItems = ref(false)

// Cooldown tracking
const COOLDOWN_MINUTES = 10
const cooldownData = ref<Record<string, number>>({}) // itemKey -> timestamp

const getItemKey = (item: { type: string, item: { id?: number } }) => {
  return `${item.type}-${item.item.id}`
}

const getTodayKey = () => {
  return new Date().toISOString().split('T')[0] // YYYY-MM-DD
}

const loadCooldownData = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-cooldowns-${today}`
  const saved = localStorage.getItem(storageKey)
  cooldownData.value = saved ? JSON.parse(saved) : {}

  // Clean up old cooldown data from localStorage
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('habit-tracker-cooldowns-') && key !== storageKey) {
      localStorage.removeItem(key)
    }
  })
}

const saveCooldownData = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-cooldowns-${today}`
  localStorage.setItem(storageKey, JSON.stringify(cooldownData.value))
}

const isItemInCooldown = (item: { type: string, item: { id?: number } }) => {
  const itemKey = getItemKey(item)
  const lastSeen = cooldownData.value[itemKey]
  if (!lastSeen) return false

  const now = Date.now()
  const cooldownEnd = lastSeen + (COOLDOWN_MINUTES * 60 * 1000)
  return now < cooldownEnd
}

const addItemToCooldown = (item: { type: string, item: { id?: number } }) => {
  const itemKey = getItemKey(item)
  cooldownData.value[itemKey] = Date.now()
  saveCooldownData()
}

const loadDailyLimit = () => {
  const saved = localStorage.getItem('habit-tracker-queue-size')
  dailyLimit.value = saved ? parseInt(saved) : 8
}

const loadCompletedCount = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-completed-${today}`
  const saved = localStorage.getItem(storageKey)
  completedToday.value = saved ? parseInt(saved) : 0

  // Clean up old completion counters
  const keys = Object.keys(localStorage)
  keys.forEach(key => {
    if (key.startsWith('habit-tracker-completed-') && key !== storageKey) {
      localStorage.removeItem(key)
    }
  })
}

const incrementCompletedCount = () => {
  completedToday.value++
  const today = getTodayKey()
  const storageKey = `habit-tracker-completed-${today}`
  localStorage.setItem(storageKey, completedToday.value.toString())
}

const loadQueue = async () => {

  // Get all items that are due today
  const [needingHabits, needingEvaluates, activeTodos] = await Promise.all([
    habitService.getNeedingCompletion(),
    evaluateService.getNeedingCompletion(),
    todoService.getActive()
  ])

  // Build available items list
  const allAvailable: Array<{ type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }> = []
  needingHabits.forEach(habit => allAvailable.push({ type: 'habit', item: habit }))
  needingEvaluates.forEach(evaluate => allAvailable.push({ type: 'evaluate', item: evaluate }))
  activeTodos.forEach(todo => allAvailable.push({ type: 'todo', item: todo }))

  availableItems.value = allAvailable

  // Filter out items in cooldown and current item (no consecutive repeats)
  const availableNow = allAvailable.filter(item => {
    // Don't repeat the same item consecutively
    if (currentItem.value && getItemKey(item) === getItemKey(currentItem.value)) {
      return false
    }
    // Don't show items in cooldown
    return !isItemInCooldown(item)
  })

  // Prioritize high priority items first, then shuffle within priority groups
  const highPriorityItems = availableNow.filter(item => item.item.isHighPrio)
  const normalPriorityItems = availableNow.filter(item => !item.item.isHighPrio)

  const shuffledHighPrio = highPriorityItems.sort(() => Math.random() - 0.5)
  const shuffledNormal = normalPriorityItems.sort(() => Math.random() - 0.5)

  const prioritizedItems = [...shuffledHighPrio, ...shuffledNormal]

  // Set current item if we haven't hit the daily limit and have items available
  if (completedToday.value < dailyLimit.value && prioritizedItems.length > 0) {
    currentItem.value = prioritizedItems[0]
  } else {
    currentItem.value = null
  }

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


const getItemTitle = (item: { type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }) => {
  if (item.type === 'habit') return (item.item as Habit).title
  if (item.type === 'evaluate') return (item.item as Evaluate).question
  if (item.type === 'todo') return (item.item as Todo).title
  return 'Unknown item'
}

const getFrequency = (item: { type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }) => {
  if (item.type !== 'habit' && item.type !== 'evaluate') return 0
  return (item.item as Habit | Evaluate).minFrequencyDays
}

const getLastCompleted = (item: { type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }) => {
  if (item.type !== 'habit' && item.type !== 'evaluate') return null
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

const markCompleted = async (item: { type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }) => {
  if (item.type === 'habit') {
    await habitService.markCompleted(item.item.id!)
  } else if (item.type === 'todo') {
    await todoService.markCompleted(item.item.id!)
  }

  incrementCompletedCount()
  await loadQueue()
}

const markProgress = async () => {
  // For todos: don't mark as completed (keep it active for later)
  // Just increment the daily counter
  incrementCompletedCount()
  await loadQueue()
}

const completeEvaluation = async (item: { type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }) => {
  if (!evaluationResponse.value.trim()) return

  await evaluateService.markCompleted(item.item.id!)
  incrementCompletedCount()
  await loadQueue()
}

const skipItem = async (item: { type: 'habit' | 'evaluate' | 'todo', item: Habit | Evaluate | Todo }) => {
  // Add item to cooldown for 10 minutes
  addItemToCooldown(item)
  // Refresh the queue to get a new item
  await loadQueue()
}

onMounted(async () => {
  loadDailyLimit()
  loadCooldownData()
  loadCompletedCount()
  await checkHasItems()
  await loadQueue()
})
</script>