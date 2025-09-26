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

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { habitService, evaluateService, todoService, queueService } from '@/services/database'
import {
  Target, Settings, Shuffle, RotateCcw, Brain, CheckSquare
} from 'lucide-vue-next'

const stats = ref({
  habits: 0,
  evaluates: 0,
  todos: 0,
  queueItems: 0
})

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

onMounted(async () => {
  await loadStats()
})
</script>