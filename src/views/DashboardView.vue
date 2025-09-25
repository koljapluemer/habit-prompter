<template>
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="navbar bg-base-100 rounded-box shadow-lg mb-6">
      <div class="navbar-start">
        <div class="flex items-center gap-3">
          <Target class="h-8 w-8 text-primary" />
          <h1 class="text-3xl font-bold text-primary">Habit Tracker</h1>
        </div>
      </div>
      <div class="navbar-end">
        <router-link to="/settings" class="btn btn-ghost">
          <Settings class="h-5 w-5" />
          Settings
        </router-link>
      </div>
    </div>

    <div class="grid gap-6">
      <!-- Stats Overview -->
      <div class="stats shadow">
        <div class="stat">
          <div class="stat-title">Active Habits</div>
          <div class="stat-value text-primary">{{ stats.habits }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Evaluations</div>
          <div class="stat-value text-secondary">{{ stats.evaluates }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Active Todos</div>
          <div class="stat-value text-accent">{{ stats.todos }}</div>
        </div>
        <div class="stat">
          <div class="stat-title">Today's Queue</div>
          <div class="stat-value text-info">{{ stats.queueItems }}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card bg-gradient-to-r from-primary/10 to-secondary/10 shadow-xl">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-2">
              <Shuffle class="h-6 w-6 text-primary" />
              <h2 class="card-title">Random Queue</h2>
            </div>
            <p class="text-base-content/70">Work through your daily randomized habit queue</p>
            <div class="card-actions">
              <router-link to="/queue" class="btn btn-primary">Open Queue</router-link>
            </div>
          </div>
        </div>

        <div class="card bg-gradient-to-r from-accent/10 to-info/10 shadow-xl">
          <div class="card-body">
            <div class="flex items-center gap-2 mb-2">
              <Settings class="h-6 w-6 text-accent" />
              <h2 class="card-title">Manage Items</h2>
            </div>
            <p class="text-base-content/70">Create and organize habits, evaluations, and todos</p>
            <div class="card-actions">
              <router-link to="/manage/habits" class="btn btn-outline">
                <RotateCcw class="h-4 w-4" />
                Habits
              </router-link>
              <router-link to="/manage/evaluate" class="btn btn-outline">
                <Brain class="h-4 w-4" />
                Evaluate
              </router-link>
              <router-link to="/manage/todo" class="btn btn-outline">
                <CheckSquare class="h-4 w-4" />
                Todos
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Items -->
      <div class="card bg-base-100 shadow-xl" v-if="todayItems.length > 0">
        <div class="card-body">
          <div class="flex items-center gap-2 mb-4">
            <Calendar class="h-6 w-6 text-primary" />
            <h2 class="card-title">Today's Items</h2>
          </div>
          <div class="grid gap-3">
            <div
              v-for="item in todayItems"
              :key="`${item.type}-${item.itemId}`"
              class="alert"
              :class="{
                'alert-success': item.completed,
                'alert-info': !item.completed && item.type === 'habit',
                'alert-warning': !item.completed && item.type === 'evaluate',
                'alert-error': !item.completed && item.type === 'todo'
              }"
            >
              <div class="flex items-center gap-3">
                <RotateCcw v-if="item.type === 'habit'" class="h-5 w-5" />
                <Brain v-else-if="item.type === 'evaluate'" class="h-5 w-5" />
                <CheckSquare v-else class="h-5 w-5" />
                <div class="flex-1">
                  <span class="font-medium">{{ getItemTitle(item) }}</span>
                  <div class="text-sm opacity-70">{{ getItemDescription(item) }}</div>
                </div>
              </div>
              <button
                v-if="!item.completed"
                @click="completeItem(item)"
                class="btn btn-sm btn-ghost"
              >
                <Check class="h-4 w-4" />
                Complete
              </button>
            </div>
          </div>
          <div class="card-actions justify-end">
            <router-link to="/queue" class="btn btn-primary btn-sm">
              <Eye class="h-4 w-4" />
              View Queue
            </router-link>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="todayItems.length === 0" class="hero bg-base-200 rounded-box min-h-64">
        <div class="hero-content text-center">
          <div>
            <PartyPopper class="h-16 w-16 mx-auto mb-4 text-success" />
            <h2 class="text-2xl font-bold mb-4">All done for today!</h2>
            <p class="text-base-content/70 mb-6">Your queue is empty. Great work!</p>
            <router-link to="/manage/habits" class="btn btn-primary">
              <Plus class="h-4 w-4" />
              Add New Habits
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { habitService, evaluateService, todoService, queueService } from '@/services/database'
import type { QueueItem, Habit, Evaluate, Todo } from '@/db'
import {
  Target, Settings, Shuffle, RotateCcw, Brain, CheckSquare,
  Calendar, Check, Eye, PartyPopper, Plus
} from 'lucide-vue-next'

const stats = ref({
  habits: 0,
  evaluates: 0,
  todos: 0,
  queueItems: 0
})

const todayItems = ref<Array<QueueItem & { item?: Habit | Evaluate | Todo }>>([])

const loadStats = async () => {
  const [habits, evaluates, todos, queue] = await Promise.all([
    habitService.getAll(),
    evaluateService.getAll(),
    todoService.getActive(),
    queueService.getForDate(new Date())
  ])

  stats.value = {
    habits: habits.length,
    evaluates: evaluates.length,
    todos: todos.length,
    queueItems: queue.length
  }
}

const loadTodayItems = async () => {
  const queueItems = await queueService.getForDate(new Date())
  const itemsWithData = await Promise.all(
    queueItems.map(async (queueItem) => {
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

  todayItems.value = itemsWithData.filter(item => item.item)
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

const completeItem = async (item: QueueItem & { item?: Habit | Evaluate | Todo }) => {
  await queueService.markCompleted(item.id!)

  if (item.type === 'habit') {
    await habitService.markCompleted(item.itemId)
  } else if (item.type === 'evaluate') {
    await evaluateService.markCompleted(item.itemId)
  } else if (item.type === 'todo') {
    await todoService.markCompleted(item.itemId)
  }

  await loadTodayItems()
  await loadStats()
}

onMounted(async () => {
  await loadStats()
  await loadTodayItems()
})
</script>