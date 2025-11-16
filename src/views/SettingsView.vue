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
        <span class="line-text">Data Export</span>
      </p>

      <div class="button-row" :class="{ stacked: isNarrow }">
        <button class="terminal-button" @click="exportData">
          Export as JSON
        </button>
      </div>

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

    <!-- Navigation -->
    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink to="/menu" class="terminal-button">Menu</RouterLink>
      <RouterLink to="/" class="terminal-button">Main</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { db } from '@/db'

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

const currentUser = ref<{ email?: string; userId?: string; name?: string } | null>(null)
const currentUserId = ref<string | null>(null)
const userInteraction = ref<DXCUserInteraction | null>(null)
const inputParams = ref<Record<string, string>>({})
const isNarrow = ref(false)

let interactionSubscription: { unsubscribe: () => void } | null = null

const isLoggedIn = computed(() => {
  // currentUserId is 'unauthorized' when not logged in, or null, or a valid user ID when logged in
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

const exportData = async () => {
  try {
    // Fetch all entities from the database
    const { entityService } = await import('@/services/database')
    const entities = await entityService.getAllEntities()

    // Create export object with metadata
    const exportData = {
      exportDate: new Date().toISOString(),
      version: '2.0',
      entities: entities.map(entity => ({
        ...entity,
        // Convert dates to ISO strings for JSON serialization
        createdAt: entity.createdAt?.toISOString(),
        lastShownAt: entity.lastShownAt?.toISOString(),
        answers: entity.answers.map(answer => ({
          ...answer,
          timestamp: answer.timestamp.toISOString()
        }))
      }))
    }

    // Create blob and download
    const jsonString = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `habit-tracker-export-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Export failed:', error)
    alert('Failed to export data. Please try again.')
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)

  // Subscribe to current user changes
  updateCurrentUser()

  // Subscribe to user interaction requests (email/OTP prompts)
  interactionSubscription = db.cloud.userInteraction.subscribe(
    (interaction: unknown) => {
      // When interaction is undefined, no user interaction is needed
      if (!interaction) {
        userInteraction.value = null
        return
      }
      // Otherwise, set it to display the prompt
      userInteraction.value = interaction as DXCUserInteraction
    }
  )

  // Poll for user changes (Dexie Cloud updates this reactively)
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
}
</style>
