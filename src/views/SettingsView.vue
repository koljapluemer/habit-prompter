<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Settings</span>
    </p>

    <div class="settings-section">
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Sync Status:</span>
      </p>

      <p class="line info">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">{{ syncStatusText }}</span>
      </p>

      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Data</span>
      </p>

      <div class="button-row" :class="{ stacked: isNarrow }">
        <button class="terminal-button" @click="exportData">Export as JSON</button>
        <button class="terminal-button" @click="triggerImport">Import from JSON</button>
        <button class="terminal-button" @click="downloadDemo">Download demo JSON</button>
      </div>

      <p v-if="importStatus" class="line info">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">{{ importStatus }}</span>
      </p>

      <input ref="fileInput" type="file" accept=".json" class="hidden-input" @change="handleFileImport" />

      <!-- User Interaction Prompts -->
      <div v-if="userInteraction" class="input-stack">
        <p v-if="userInteraction.title" class="line">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">{{ userInteraction.title }}</span>
        </p>

        <p v-for="(alert, i) in userInteraction.alerts" :key="i" class="line info">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">{{ alert.messageCode }}</span>
        </p>

        <template v-if="userInteraction.fields">
          <div v-for="([fieldName, field], idx) in Object.entries(userInteraction.fields)" :key="idx" class="input-block">
            <p v-if="field.label" class="line">
              <span class="prompt-symbol">&gt;</span>
              <span class="line-text">{{ field.label }}</span>
            </p>
            <div class="input-wrapper">
              <span class="prompt-symbol">&gt;</span>
              <input
                v-model="inputParams[fieldName]"
                class="line-input"
                :type="field.type"
                :placeholder="field.placeholder"
                autocomplete="off"
                autocapitalize="none"
                spellcheck="false"
                @keyup.enter="submitInteraction"
              />
            </div>
          </div>
        </template>

        <div class="button-row" :class="{ stacked: isNarrow }">
          <button class="terminal-button" @click="submitInteraction">
            {{ userInteraction.submitLabel || 'Submit' }}
          </button>
          <button v-if="userInteraction.cancelLabel" class="terminal-button" @click="cancelInteraction">
            {{ userInteraction.cancelLabel }}
          </button>
        </div>
      </div>

      <!-- Login/Logout Buttons -->
      <div v-else class="button-row" :class="{ stacked: isNarrow }">
        <button v-if="!isLoggedIn" class="terminal-button" @click="handleLogin">
          Login to Sync
        </button>
        <button v-else class="terminal-button" @click="handleLogout">
          Logout
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '@/db'
import type { Prompt, TextAnswer } from '@/db'
import { promptService } from '@/services/database'

interface DXCInputField {
  type: string
  label?: string
  placeholder?: string
}

interface DXCUserInteraction {
  type: 'email' | 'otp' | 'message-alert' | 'logout-confirmation'
  title?: string
  alerts?: Array<{ type: string; messageCode: string }>
  fields?: { [fieldName: string]: DXCInputField }
  submitLabel?: string
  cancelLabel?: string
  onSubmit: (params: Record<string, string>) => void
  onCancel?: () => void
}

interface ExportFormat {
  exportDate: string
  version: '3.0'
  entities: Array<Omit<Prompt, 'id' | 'createdAt' | 'lastShownAt' | 'answers'> & {
    id?: string
    createdAt: string
    lastShownAt?: string
    answers: Array<{ timestamp: string; text: string }>
  }>
}

const currentUser = ref<{ email?: string; userId?: string; name?: string } | null>(null)
const currentUserId = ref<string | null>(null)
const userInteraction = ref<DXCUserInteraction | null>(null)
const inputParams = ref<Record<string, string>>({})
const isNarrow = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const importStatus = ref('')

let interactionSubscription: { unsubscribe: () => void } | null = null

const isLoggedIn = computed(() => {
  return currentUserId.value !== null && currentUserId.value !== 'unauthorized'
})

const syncStatusText = computed(() => {
  if (isLoggedIn.value && currentUser.value?.email) {
    return `Synced as ${currentUser.value.email}`
  }
  if (isLoggedIn.value && currentUserId.value) {
    return `Synced (userId: ${currentUserId.value})`
  }
  return 'Not synced (local only)'
})

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

const handleLogin = async () => {
  try {
    await db.cloud.login()
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const handleLogout = async () => {
  try {
    await db.cloud.logout()
    currentUser.value = null
    currentUserId.value = null
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const submitInteraction = () => {
  if (!userInteraction.value) return
  userInteraction.value.onSubmit(inputParams.value)
  inputParams.value = {}
}

const cancelInteraction = () => {
  if (!userInteraction.value) return
  if (userInteraction.value.onCancel) {
    userInteraction.value.onCancel()
  }
  inputParams.value = {}
}

const updateCurrentUser = () => {
  currentUser.value = db.cloud.currentUser
  currentUserId.value = db.cloud.currentUserId
}

const downloadJson = (data: unknown, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

const exportData = async () => {
  try {
    const entities = await promptService.getAll()
    const payload: ExportFormat = {
      exportDate: new Date().toISOString(),
      version: '3.0',
      entities: entities.map(({ id, prompt, interval, createdAt, lastShownAt, answers }) => ({
        id,
        prompt,
        interval,
        createdAt: createdAt.toISOString(),
        lastShownAt: lastShownAt?.toISOString(),
        answers: answers.map(a => ({ timestamp: a.timestamp.toISOString(), text: a.text }))
      }))
    }
    downloadJson(payload, `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data. Please try again.')
  }
}

const downloadDemo = () => {
  const demo: ExportFormat = {
    exportDate: new Date().toISOString(),
    version: '3.0',
    entities: [
      {
        id: 'demo-1',
        prompt: 'What are you grateful for today?',
        interval: 1,
        createdAt: new Date().toISOString(),
        lastShownAt: undefined,
        answers: [
          { timestamp: new Date().toISOString(), text: 'Good weather and coffee.' }
        ]
      },
      {
        id: 'demo-2',
        prompt: 'Did you exercise this week?',
        interval: 7,
        createdAt: new Date().toISOString(),
        lastShownAt: undefined,
        answers: []
      }
    ]
  }
  downloadJson(demo, 'habit-tracker-demo.json')
}

const triggerImport = () => {
  importStatus.value = ''
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  try {
    const text = await file.text()
    const parsed = JSON.parse(text) as ExportFormat

    if (!parsed.version || !Array.isArray(parsed.entities)) {
      importStatus.value = 'error: invalid file format'
      return
    }

    const toImport: Omit<Prompt, 'id'>[] = parsed.entities.map(e => ({
      prompt: e.prompt,
      interval: e.interval,
      createdAt: new Date(e.createdAt),
      lastShownAt: e.lastShownAt ? new Date(e.lastShownAt) : undefined,
      answers: (e.answers ?? []).map((a): TextAnswer => ({
        timestamp: new Date(a.timestamp),
        text: a.text
      }))
    }))

    for (const entity of toImport) {
      await promptService.create(entity)
    }

    importStatus.value = `imported ${toImport.length} prompt(s)`
  } catch (error) {
    console.error('Import failed:', error)
    importStatus.value = 'error: could not parse file'
  } finally {
    input.value = ''
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  updateCurrentUser()

  interactionSubscription = db.cloud.userInteraction.subscribe(
    (interaction: unknown) => {
      if (!interaction) {
        userInteraction.value = null
        return
      }
      userInteraction.value = interaction as DXCUserInteraction
    }
  )

  const userCheckInterval = setInterval(updateCurrentUser, 1000)

  onUnmounted(() => {
    clearInterval(userCheckInterval)
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (interactionSubscription) {
    interactionSubscription.unsubscribe()
  }
})
</script>

<style scoped>
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.hidden-input {
  display: none;
}
</style>
