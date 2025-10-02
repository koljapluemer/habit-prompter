<template>
  <div class="container mx-auto p-6 max-w-4xl">
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <div class="flex items-center gap-4 mb-6">
          <router-link to="/" class="btn btn-ghost btn-circle">
            <ArrowLeft class="h-6 w-6" />
          </router-link>
          <div class="flex items-center gap-2">
            <Settings class="h-8 w-8 text-primary" />
            <h1 class="card-title text-3xl">Settings</h1>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Cloud Sync Section -->
          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <Cloud class="h-6 w-6 text-primary" />
                <h2 class="card-title text-xl">Cloud Sync</h2>
              </div>

              <div v-if="!isCloudSynced" class="space-y-4">
                <div class="alert alert-info">
                  <Info class="stroke-current shrink-0 h-6 w-6" />
                  <div>
                    <h3 class="font-bold">Enable Cloud Sync</h3>
                    <div class="text-sm">Sync your data across devices and keep it backed up automatically</div>
                  </div>
                </div>

                <button
                  @click="enableCloudSync"
                  :disabled="isLoading"
                  class="btn btn-primary btn-wide"
                >
                  <span v-if="isLoading" class="loading loading-spinner"></span>
                  <Cloud v-else class="h-5 w-5" />
                  Enable Cloud Sync
                </button>
              </div>

              <div v-else class="space-y-4">
                <div class="alert alert-success">
                  <CheckCircle class="stroke-current shrink-0 h-6 w-6" />
                  <div>
                    <h3 class="font-bold">Cloud Sync Enabled</h3>
                    <div class="text-sm">{{ userEmail }}</div>
                  </div>
                </div>

                <div class="alert alert-info">
                  <Info class="stroke-current shrink-0 h-6 w-6" />
                  <div class="text-sm">
                    Your data syncs automatically across all your devices when you're online.
                  </div>
                </div>

                <div class="card-actions">
                  <button
                    @click="disableCloudSync"
                    class="btn btn-error btn-outline"
                  >
                    Disable Sync
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Queue Settings Section -->
          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <Shuffle class="h-6 w-6 text-secondary" />
                <h2 class="card-title text-xl">Queue Settings</h2>
              </div>

              <div class="form-control mb-4">
                <label class="label">
                  <span class="label-text">Daily queue size</span>
                  <span class="label-text-alt">items per day</span>
                </label>
                <input
                  v-model.number="queueSize"
                  @change="updateQueueSize"
                  type="number"
                  min="3"
                  max="15"
                  class="input input-bordered w-24"
                  placeholder="8"
                />
                <div class="text-xs text-base-content/70 mt-1">
                  Choose between 3-15 items per day
                </div>
              </div>

              <div class="alert alert-info">
                <Info class="stroke-current shrink-0 h-6 w-6" />
                <div>
                  <div class="text-sm">
                    The queue will randomly select up to {{ queueSize }} items from your habits, evaluations, and todos each day.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- App Info Section -->
          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <Smartphone class="h-6 w-6 text-accent" />
                <h2 class="card-title text-xl">App Information</h2>
              </div>

              <div class="stats shadow">
                <div class="stat">
                  <div class="stat-title">Total Habits</div>
                  <div class="stat-value">{{ totalHabits }}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Total Items</div>
                  <div class="stat-value">{{ totalItems }}</div>
                </div>
                <div class="stat">
                  <div class="stat-title">Database Size</div>
                  <div class="stat-value text-sm">{{ databaseSize }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { db } from '@/db'
import { habitService, evaluateService, todoService } from '@/services/database'
import {
  ArrowLeft, Settings, Info, CheckCircle, Cloud,
  Shuffle, Smartphone
} from 'lucide-vue-next'

const isLoading = ref(false)
const isCloudSynced = ref(false)
const userEmail = ref('')
const queueSize = ref(8)
const totalHabits = ref(0)
const totalItems = ref(0)
const databaseSize = ref('0 KB')

const loadStats = async () => {
  const [habits, evaluates, todos] = await Promise.all([
    habitService.getAll(),
    evaluateService.getAll(),
    todoService.getAll()
  ])

  totalHabits.value = habits.length
  totalItems.value = habits.length + evaluates.length + todos.length

  // Calculate database size
  const data = JSON.stringify({ habits, evaluates, todos })
  const sizeInBytes = new Blob([data]).size
  const sizeInKB = Math.round(sizeInBytes / 1024)

  if (sizeInKB > 1024) {
    const sizeInMB = Math.round(sizeInKB / 1024 * 10) / 10
    databaseSize.value = `${sizeInMB} MB`
  } else {
    databaseSize.value = `${sizeInKB} KB`
  }
}

const loadQueueSize = () => {
  const saved = localStorage.getItem('habit-tracker-queue-size')
  if (saved) {
    queueSize.value = parseInt(saved)
  }
}

const updateQueueSize = () => {
  localStorage.setItem('habit-tracker-queue-size', queueSize.value.toString())
}

// Subscribe to currentUser observable
const userSubscription = db.cloud.currentUser.subscribe(user => {
  isCloudSynced.value = user?.isLoggedIn || false
  userEmail.value = user?.email || ''
})

const enableCloudSync = async () => {
  isLoading.value = true
  try {
    await db.cloud.login()
  } catch (error) {
    console.error('Failed to enable cloud sync:', error)
    alert('Failed to enable cloud sync')
  }
  isLoading.value = false
}

const disableCloudSync = async () => {
  if (confirm('Are you sure you want to disable cloud sync? Your data will remain on this device but will no longer sync.')) {
    try {
      await db.cloud.logout()
    } catch (error) {
      console.error('Failed to disable cloud sync:', error)
      alert('Failed to disable cloud sync')
    }
  }
}

onMounted(() => {
  loadStats()
  loadQueueSize()
})

onUnmounted(() => {
  userSubscription.unsubscribe()
})
</script>
