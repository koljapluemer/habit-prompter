<template>
  <div class="screen" v-if="action">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Edit action (step {{ stepNumber }} of {{ totalSteps }})</span>
    </p>

    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">{{ currentStep.prompt }}</span>
    </p>

    <p class="line info">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Current: {{ currentValue }}</span>
    </p>

    <div v-if="currentStep.type === 'choice'" class="button-row stacked">
      <button
        v-for="option in currentStep.options"
        :key="option.value"
        class="terminal-button"
        @click="selectModality(option.value)"
      >
        {{ option.label }}
      </button>
      <button class="terminal-button" @click="keepCurrent">Keep</button>
    </div>

    <div v-if="currentStep.type === 'input'" class="input-block">
      <div class="input-wrapper">
        <span class="prompt-symbol">&gt;</span>
        <input
          v-model="contentInput"
          class="line-input"
          type="text"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="button-row">
        <button class="terminal-button" @click="confirmContent">Next</button>
      </div>
    </div>

    <div v-if="currentStep.type === 'number'" class="input-block">
      <div class="input-wrapper">
        <span class="prompt-symbol">&gt;</span>
        <input
          class="line-input"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          :value="intervalInput"
          @input="onIntervalInput"
        />
      </div>
      <div class="button-row">
        <button class="terminal-button" @click="confirmInterval">Next</button>
      </div>
    </div>

    <div v-if="currentStep.type === 'boolean'" class="button-row">
      <button class="terminal-button" @click="confirmBoolean(true)">Yes</button>
      <button class="terminal-button" @click="confirmBoolean(false)">No</button>
      <button class="terminal-button" @click="keepCurrent">Keep</button>
    </div>

    <div class="button-row nav-row">
      <button class="terminal-button" @click="goBack" :disabled="stepIndex === 0">Back</button>
      <RouterLink :to="`/actions/${action.id}`" class="terminal-button">Cancel</RouterLink>
    </div>
  </div>
  <div v-else class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Action not found.</span>
    </p>
    <div class="button-row nav-row">
      <RouterLink to="/actions" class="terminal-button">Back to list</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { actionService, type Action, type Modality } from '@/services/database'

const props = defineProps<{ id: string }>()

type ChoiceStep = {
  key: 'modality'
  type: 'choice'
  prompt: string
  options: Array<{ label: string; value: Modality }>
}

type InputStep = {
  key: 'content'
  type: 'input'
  prompt: string
}

type NumberStep = {
  key: 'intervalDays'
  type: 'number'
  prompt: string
}

type BooleanStep = {
  key: 'isFinishable' | 'isHighPrio'
  type: 'boolean'
  prompt: string
}

type Step = ChoiceStep | InputStep | NumberStep | BooleanStep

const steps: Step[] = [
  {
    key: 'modality',
    type: 'choice',
    prompt: 'Change modality?',
    options: [
      { label: 'Do', value: 'do' },
      { label: 'Schedule', value: 'schedule' },
      { label: 'Answer', value: 'answer' },
      { label: 'Yes / No', value: 'yes-no' },
      { label: 'One to Ten', value: 'one-to-ten' },
    ],
  },
  {
    key: 'content',
    type: 'input',
    prompt: 'Update the description? (leave blank to keep)',
  },
  {
    key: 'intervalDays',
    type: 'number',
    prompt: 'Update interval in days? (leave blank to keep)',
  },
  {
    key: 'isFinishable',
    type: 'boolean',
    prompt: 'Toggle finishable?',
  },
  {
    key: 'isHighPrio',
    type: 'boolean',
    prompt: 'Toggle high priority?',
  },
]

const router = useRouter()
const action = ref<Action | null>(null)

const stepIndex = ref(0)
const modalityOverride = ref<Modality | null>(null)
const contentOverride = ref<string | null>(null)
const intervalOverride = ref<number | null>(null)
const finishableOverride = ref<boolean | null>(null)
const highPrioOverride = ref<boolean | null>(null)

const contentInput = ref('')
const intervalInput = ref('')

const currentStep = computed(() => steps[stepIndex.value])
const stepNumber = computed(() => stepIndex.value + 1)
const totalSteps = steps.length

const currentValue = computed(() => {
  if (!action.value) return ''
  switch (currentStep.value.key) {
    case 'modality':
      return action.value.modality
    case 'content':
      return action.value.content
    case 'intervalDays':
      return `${action.value.intervalDays}`
    case 'isFinishable':
      return action.value.isFinishable ? 'Yes' : 'No'
    case 'isHighPrio':
      return action.value.isHighPrio ? 'Yes' : 'No'
    default:
      return ''
  }
})

const selectModality = (value: Modality) => {
  modalityOverride.value = value
  next()
}

const keepCurrent = () => {
  switch (currentStep.value.key) {
    case 'modality':
      modalityOverride.value = null
      break
    case 'content':
      contentOverride.value = null
      break
    case 'intervalDays':
      intervalOverride.value = null
      break
    case 'isFinishable':
      finishableOverride.value = null
      break
    case 'isHighPrio':
      highPrioOverride.value = null
      break
  }
  next()
}

const confirmContent = () => {
  const trimmed = contentInput.value.trim()
  contentOverride.value = trimmed.length ? trimmed : null
  contentInput.value = ''
  next()
}

const onIntervalInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/[^0-9]/g, '')
  intervalInput.value = digits
  input.value = digits
}

const confirmInterval = () => {
  if (!intervalInput.value) {
    intervalOverride.value = null
  } else {
    const numeric = parseInt(intervalInput.value, 10)
    intervalOverride.value = Number.isNaN(numeric) ? null : Math.max(1, numeric)
  }
  intervalInput.value = ''
  next()
}

const confirmBoolean = (value: boolean) => {
  if (currentStep.value.key === 'isFinishable') {
    finishableOverride.value = value
  } else if (currentStep.value.key === 'isHighPrio') {
    highPrioOverride.value = value
  }
  next()
}

const next = () => {
  if (stepIndex.value >= steps.length - 1) {
    finalize()
    return
  }
  stepIndex.value++
}

const goBack = () => {
  if (stepIndex.value === 0) return
  stepIndex.value--
}

const finalize = async () => {
  if (!action.value) return
  const updates: Partial<Action> = {}

  if (modalityOverride.value && modalityOverride.value !== action.value.modality) {
    updates.modality = modalityOverride.value
  }

  if (contentOverride.value !== null && contentOverride.value !== action.value.content) {
    updates.content = contentOverride.value
  }

  if (intervalOverride.value !== null && intervalOverride.value !== action.value.intervalDays) {
    updates.intervalDays = intervalOverride.value
  }

  if (finishableOverride.value !== null && finishableOverride.value !== action.value.isFinishable) {
    updates.isFinishable = finishableOverride.value
    if (!finishableOverride.value) {
      updates.isCompleted = false
      updates.completedAt = undefined
    }
  }

  if (highPrioOverride.value !== null && highPrioOverride.value !== action.value.isHighPrio) {
    updates.isHighPrio = highPrioOverride.value
  }

  if (Object.keys(updates).length > 0) {
    await actionService.update(action.value.id!, updates)
  }

  router.push({ name: 'action-detail', params: { id: action.value.id } })
}

const loadAction = async () => {
  const loaded = await actionService.getById(props.id)
  action.value = loaded ?? null
}

onMounted(async () => {
  await loadAction()
})
</script>
