<template>
  <div class="screen">

    <p v-if="displayedAction" class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">{{ displayedAction.content }}</span>
    </p>

    <p v-else class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">{{ statusMessage }}</span>
    </p>

    <div v-if="currentAction && !finishPromptAction" class="interaction">
      <div v-if="requiresTextInput" class="input-stack">
        <label class="line input-label">
          <span class="prompt-symbol">&gt;</span>
          <span class="line-text">{{ inputPrompt }}</span>
        </label>
        <div class="input-wrapper">
          <span class="prompt-symbol">&gt;</span>
          <input v-if="currentAction.modality !== 'one-to-ten'" v-model="textResponse" class="line-input" type="text"
            autocomplete="off" autocapitalize="none" spellcheck="false" />
          <input v-else :value="ratingResponse" class="line-input" type="text" inputmode="numeric" autocomplete="off"
            @input="onRatingInput" />
        </div>
      </div>

      <div class="button-row" :class="{ stacked: isNarrow }">
        <button v-if="currentAction.modality === 'do'" class="terminal-button" @click="markNotToday(currentAction)">
          Not Today
        </button>
        <button v-if="currentAction.modality === 'do'" class="terminal-button" @click="skipAction(currentAction)">
          Later
        </button>

        <button v-if="currentAction.modality === 'yes-no'" class="terminal-button"
          @click="completeYesNo(currentAction)">
          No
        </button>
        <button v-if="currentAction.modality === 'yes-no'" class="terminal-button"
          @click="completeYesNo(currentAction)">
          Kind Of
        </button>
        <button v-if="currentAction.modality === 'yes-no'" class="terminal-button"
          @click="completeYesNo(currentAction)">
          Yes
        </button>

        <button v-if="currentAction.modality === 'schedule' || currentAction.modality === 'answer'"
          class="terminal-button" @click="skipAction(currentAction)">
          Skip
        </button>

        <button v-if="showDoneButton" class="terminal-button" :class="{ disabled: !doneEnabled }"
          :disabled="!doneEnabled" @click="markDone(currentAction)">
          Done
        </button>
      </div>
    </div>

    <div v-if="finishPromptAction" class="finish-block">
      <p class="line">
        <span class="prompt-symbol">&gt;</span>
        <span class="line-text">Is this task finished?</span>
      </p>
      <div class="button-row" :class="{ stacked: isNarrow }">
        <button class="terminal-button" @click="confirmFinished(true)">Yes</button>
        <button class="terminal-button" @click="confirmFinished(false)">No</button>
      </div>
    </div>

    <div class="button-row nav-row" :class="{ stacked: isNarrow }">
      <RouterLink to="/menu" class="terminal-button">Menu</RouterLink>
      <RouterLink v-if="displayedAction" :to="`/actions/${displayedAction.id}`" class="terminal-button">View</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { actionService, type Action } from '@/services/database'

const currentAction = ref<Action | null>(null)
const finishPromptAction = ref<Action | null>(null)
const availableActions = ref<Action[]>([])

const textResponse = ref('')
const ratingResponse = ref('')
const completedToday = ref(0)
const dailyLimit = ref(0)

const isNarrow = ref(false)

const COOLDOWN_MINUTES = 10
const cooldownData = ref<Record<string, number>>({})
const notTodayData = ref<Record<string, boolean>>({})

const displayedAction = computed(() => finishPromptAction.value ?? currentAction.value)

const requiresTextInput = computed(() => {
  const action = currentAction.value
  if (!action) return false
  return action.modality === 'schedule' || action.modality === 'answer' || action.modality === 'one-to-ten'
})

const inputPrompt = computed(() => {
  const action = currentAction.value
  if (!action) return ''
  if (action.modality === 'schedule') return 'Schedule:'
  if (action.modality === 'answer') return 'Answer:'
  if (action.modality === 'one-to-ten') return 'Rate from 1-10:'
  return ''
})

const doneEnabled = computed(() => {
  const action = currentAction.value
  if (!action) return false
  if (action.modality === 'schedule' || action.modality === 'answer') {
    return textResponse.value.trim().length >= 3
  }
  if (action.modality === 'one-to-ten') {
    const numeric = Number(ratingResponse.value)
    return Number.isInteger(numeric) && numeric >= 1 && numeric <= 10
  }
  return true
})

const showDoneButton = computed(() => {
  const action = currentAction.value
  if (!action) return false
  return action.modality !== 'yes-no'
})

const statusMessage = computed(() => {
  if (finishPromptAction.value) {
    return 'Awaiting completion confirmation.'
  }
  if (completedToday.value >= dailyLimit.value) {
    return 'Daily limit reached. You are done for today.'
  }
  if (availableActions.value.length === 0) {
    return 'Queue empty. Enjoy the calm.'
  }
  return 'Nothing due right now.'
})

const getTodayKey = () => new Date().toISOString().split('T')[0]

const loadDailyLimit = () => {
  const saved = localStorage.getItem('habit-tracker-queue-size')
  dailyLimit.value = saved ? parseInt(saved, 10) : 8
}

const loadCompletedCount = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-completed-${today}`
  const saved = localStorage.getItem(storageKey)
  completedToday.value = saved ? parseInt(saved, 10) : 0

  Object.keys(localStorage).forEach(key => {
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

const loadCooldownData = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-cooldowns-${today}`
  const saved = localStorage.getItem(storageKey)
  cooldownData.value = saved ? JSON.parse(saved) : {}

  Object.keys(localStorage).forEach(key => {
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

const loadNotTodayData = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-not-today-${today}`
  const saved = localStorage.getItem(storageKey)
  notTodayData.value = saved ? JSON.parse(saved) : {}

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('habit-tracker-not-today-') && key !== storageKey) {
      localStorage.removeItem(key)
    }
  })
}

const saveNotTodayData = () => {
  const today = getTodayKey()
  const storageKey = `habit-tracker-not-today-${today}`
  localStorage.setItem(storageKey, JSON.stringify(notTodayData.value))
}

const getActionKey = (action: Action) => `action-${action.id}`

const isInCooldown = (action: Action) => {
  const key = getActionKey(action)
  const lastSeen = cooldownData.value[key]
  if (!lastSeen) return false
  const now = Date.now()
  return now < lastSeen + COOLDOWN_MINUTES * 60 * 1000
}

const addCooldown = (action: Action) => {
  const key = getActionKey(action)
  cooldownData.value[key] = Date.now()
  saveCooldownData()
}

const markNotTodayFlag = (action: Action) => {
  const key = getActionKey(action)
  notTodayData.value[key] = true
  saveNotTodayData()
}

const isMarkedNotToday = (action: Action) => {
  const key = getActionKey(action)
  return Boolean(notTodayData.value[key])
}

const shuffle = <T,>(items: T[]) => [...items].sort(() => Math.random() - 0.5)

const pickNextAction = () => {
  if (completedToday.value >= dailyLimit.value) {
    currentAction.value = null
    return
  }

  const filtered = availableActions.value.filter(action => {
    if (finishPromptAction.value?.id === action.id) return false
    if (isMarkedNotToday(action)) return false
    if (isInCooldown(action)) return false
    return true
  })

  const high = shuffle(filtered.filter(action => action.isHighPrio))
  const normal = shuffle(filtered.filter(action => !action.isHighPrio))
  const prioritized = [...high, ...normal]

  currentAction.value = prioritized[0] ?? null
}

const loadQueue = async () => {
  const candidates = await actionService.getQueueCandidates()
  availableActions.value = candidates
  pickNextAction()
}

const resetInputs = () => {
  textResponse.value = ''
  ratingResponse.value = ''
}

const skipAction = async (action: Action) => {
  addCooldown(action)
  resetInputs()
  await loadQueue()
}

const markNotToday = async (action: Action) => {
  markNotTodayFlag(action)
  resetInputs()
  await loadQueue()
}

const handleCompletion = async (action: Action) => {
  await actionService.recordInteraction(action.id!)
  incrementCompletedCount()
  resetInputs()
}

const markDone = async (action: Action) => {
  if (!doneEnabled.value) return
  await handleCompletion(action)

  if (action.isFinishable) {
    finishPromptAction.value = action
    currentAction.value = null
  } else {
    await loadQueue()
  }
}

const completeYesNo = async (action: Action) => {
  await handleCompletion(action)
  if (action.isFinishable) {
    finishPromptAction.value = action
    currentAction.value = null
  } else {
    await loadQueue()
  }
}

const confirmFinished = async (finished: boolean) => {
  const action = finishPromptAction.value
  if (!action) return

  if (finished) {
    await actionService.markFinished(action.id!)
  }

  finishPromptAction.value = null
  await loadQueue()
}

const onRatingInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const digits = target.value.replace(/[^0-9]/g, '')
  if (!digits) {
    ratingResponse.value = ''
    target.value = ''
    return
  }
  const numeric = Math.min(10, parseInt(digits.slice(0, 2), 10))
  if (Number.isNaN(numeric) || numeric < 1) {
    ratingResponse.value = ''
    target.value = ''
    return
  }
  ratingResponse.value = String(numeric)
  target.value = ratingResponse.value
}

const handleResize = () => {
  isNarrow.value = window.innerWidth < 600
}

onMounted(async () => {
  handleResize()
  window.addEventListener('resize', handleResize)
  loadDailyLimit()
  loadCompletedCount()
  loadCooldownData()
  loadNotTodayData()
  await loadQueue()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>
