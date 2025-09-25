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
          <!-- Google Drive Backup Section -->
          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <RotateCcw class="h-6 w-6 text-primary" />
                <h2 class="card-title text-xl">Backup & Sync</h2>
              </div>

              <div v-if="!isGoogleConnected" class="space-y-4">
                <div class="alert alert-info">
                  <Info class="stroke-current shrink-0 h-6 w-6" />
                  <div>
                    <h3 class="font-bold">Connect Google Drive</h3>
                    <div class="text-sm">Back up your habits, evaluations, and todos to Google Drive automatically</div>
                  </div>
                </div>

                <button
                  @click="connectGoogle"
                  :disabled="isLoading"
                  class="btn btn-primary btn-wide"
                >
                  <span v-if="isLoading" class="loading loading-spinner"></span>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Connect Google Drive
                </button>
              </div>

              <div v-else class="space-y-4">
                <div class="alert alert-success">
                  <CheckCircle class="stroke-current shrink-0 h-6 w-6" />
                  <div>
                    <h3 class="font-bold">Connected to Google Drive</h3>
                    <div class="text-sm">Account: {{ googleUserEmail }}</div>
                  </div>
                </div>

                <div class="stats shadow">
                  <div class="stat">
                    <div class="stat-title">Last Backup</div>
                    <div class="stat-value text-sm">{{ lastBackupTime || 'Never' }}</div>
                  </div>
                  <div class="stat">
                    <div class="stat-title">Auto Backup</div>
                    <div class="stat-value text-sm">{{ autoBackupEnabled ? 'On' : 'Off' }}</div>
                  </div>
                </div>

                <div class="card-actions">
                  <button
                    @click="backupToGoogleDrive"
                    :disabled="isBackingUp"
                    class="btn btn-primary"
                  >
                    <span v-if="isBackingUp" class="loading loading-spinner"></span>
                    <CloudDownload v-else class="h-4 w-4" />
                    {{ isBackingUp ? 'Backing up...' : 'Backup Now' }}
                  </button>

                  <button
                    @click="restoreFromGoogleDrive"
                    :disabled="isRestoring"
                    class="btn btn-secondary"
                  >
                    <span v-if="isRestoring" class="loading loading-spinner"></span>
                    <CloudUpload v-else class="h-4 w-4" />
                    {{ isRestoring ? 'Restoring...' : 'Restore from Backup' }}
                  </button>

                  <div class="form-control">
                    <label class="label cursor-pointer">
                      <span class="label-text">Auto backup daily</span>
                      <input
                        v-model="autoBackupEnabled"
                        @change="updateAutoBackup"
                        type="checkbox"
                        class="toggle toggle-primary"
                      />
                    </label>
                  </div>

                  <button
                    @click="disconnectGoogle"
                    class="btn btn-error btn-outline"
                  >
                    Disconnect
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
                  <span class="label-text-alt">{{ queueSize }} items per day</span>
                </label>
                <input
                  v-model.number="queueSize"
                  @change="updateQueueSize"
                  type="range"
                  min="3"
                  max="15"
                  class="range range-secondary"
                />
                <div class="w-full flex justify-between text-xs px-2 mt-2">
                  <span>3</span>
                  <span>5</span>
                  <span>8</span>
                  <span>10</span>
                  <span>15</span>
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

          <!-- Local Backup Section -->
          <div class="card bg-base-200">
            <div class="card-body">
              <div class="flex items-center gap-2 mb-4">
                <HardDrive class="h-6 w-6 text-info" />
                <h2 class="card-title text-xl">Local Backup</h2>
              </div>

              <div class="card-actions">
                <button
                  @click="exportLocalBackup"
                  class="btn btn-outline"
                >
                  <Download class="h-4 w-4" />
                  Export Data (JSON)
                </button>

                <input
                  ref="fileInput"
                  type="file"
                  accept=".json"
                  @change="importLocalBackup"
                  class="file-input file-input-bordered file-input-sm"
                />
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
import { ref, onMounted } from 'vue'
import { googleAuth } from '@/services/googleAuth'
import { googleDrive } from '@/services/googleDrive'
import { backupService } from '@/services/backup'
import { habitService, evaluateService, todoService } from '@/services/database'
import {
  ArrowLeft, Settings, RotateCcw, Info, CheckCircle, CloudDownload,
  CloudUpload, Shuffle, HardDrive, Download, Smartphone
} from 'lucide-vue-next'

const isLoading = ref(false)
const isBackingUp = ref(false)
const isRestoring = ref(false)
const isGoogleConnected = ref(false)
const googleUserEmail = ref('')
const lastBackupTime = ref('')
const autoBackupEnabled = ref(false)
const queueSize = ref(8)
const totalHabits = ref(0)
const totalItems = ref(0)
const databaseSize = ref('0 KB')
const fileInput = ref<HTMLInputElement>()

const loadStats = async () => {
  const [habits, evaluates, todos, stats] = await Promise.all([
    habitService.getAll(),
    evaluateService.getAll(),
    todoService.getAll(),
    backupService.getStats()
  ])

  totalHabits.value = habits.length
  totalItems.value = habits.length + evaluates.length + todos.length
  databaseSize.value = stats.databaseSize
}

const loadGoogleStatus = async () => {
  const status = await googleAuth.getStatus()
  isGoogleConnected.value = status.connected
  googleUserEmail.value = status.email || ''
  lastBackupTime.value = status.lastBackup || ''
  autoBackupEnabled.value = status.autoBackup || false
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

const connectGoogle = async () => {
  isLoading.value = true
  try {
    await googleAuth.signIn()
    await loadGoogleStatus()
  } catch (error) {
    console.error('Failed to connect Google:', error)
    alert('Failed to connect to Google Drive')
  }
  isLoading.value = false
}

const disconnectGoogle = async () => {
  if (confirm('Are you sure you want to disconnect Google Drive?')) {
    await googleAuth.signOut()
    await loadGoogleStatus()
  }
}

const backupToGoogleDrive = async () => {
  isBackingUp.value = true
  try {
    await googleDrive.backup()
    await loadGoogleStatus()
    alert('Backup completed successfully!')
  } catch (error) {
    console.error('Backup failed:', error)
    const message = error instanceof Error ? error.message : 'Backup failed. Please try again.'
    alert(message)
  }
  isBackingUp.value = false
}

const restoreFromGoogleDrive = async () => {
  if (!confirm('This will replace all current data. Continue?')) return

  isRestoring.value = true
  try {
    await googleDrive.restore()
    alert('Data restored successfully! Refreshing...')
    window.location.reload()
  } catch (error) {
    console.error('Restore failed:', error)
    alert('Restore failed. Please try again.')
  }
  isRestoring.value = false
}

const updateAutoBackup = async () => {
  await googleAuth.updateAutoBackup(autoBackupEnabled.value)
}

const exportLocalBackup = async () => {
  try {
    await backupService.exportToFile()
  } catch (error) {
    console.error('Export failed:', error)
    alert('Export failed. Please try again.')
  }
}

const importLocalBackup = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  if (!confirm('This will replace all current data. Continue?')) {
    if (fileInput.value) fileInput.value.value = ''
    return
  }

  try {
    await backupService.importFromFile(file)
    alert('Data imported successfully! Refreshing...')
    window.location.reload()
  } catch (error) {
    console.error('Import failed:', error)
    alert('Import failed. Please check the file format.')
  }

  if (fileInput.value) fileInput.value.value = ''
}

onMounted(() => {
  loadStats()
  loadGoogleStatus()
  loadQueueSize()
})
</script>
