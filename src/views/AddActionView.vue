<template>
  <div class="screen">
    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">Create a new action (step {{ stepNumber }} of {{ totalSteps }})</span>
    </p>

    <p class="line">
      <span class="prompt-symbol">&gt;</span>
      <span class="line-text">{{ currentStep.prompt }}</span>
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
        <button class="terminal-button" :class="{ disabled: contentInput.trim().length < 3 }" :disabled="contentInput.trim().length < 3" @click="confirmContent">Next</button>
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
        <button class="terminal-button" :class="{ disabled: !intervalValid }" :disabled="!intervalValid" @click="confirmInterval">Next</button>
      </div>
    </div>

    <div v-if="currentStep.type === 'boolean'" class="button-row">
      <button class="terminal-button" @click="confirmBoolean(true)">Yes</button>
      <button class="terminal-button" @click="confirmBoolean(false)">No</button>
    </div>

    <div class="button-row nav-row">
      <button class="terminal-button" @click="goBack" :disabled="stepIndex === 0">Back</button>
      <RouterLink to="/menu" class="terminal-button">Cancel</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { actionService, type Modality } from '@/services/database'

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
    prompt: 'Select the modality.',
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
    prompt: 'Describe the action.',
  },
  {
    key: 'intervalDays',
    type: 'number',
    prompt: 'Interval in days?',
  },
  {
    key: 'isFinishable',
    type: 'boolean',
    prompt: 'Is this action finishable?',
  },
  {
    key: 'isHighPrio',
    type: 'boolean',
    prompt: 'Mark as high priority?',
  },
]

const router = useRouter()
const stepIndex = ref(0)
const modality = ref<Modality | null>(null)
const contentInput = ref('')
const intervalInput = ref('')
const intervalValid = ref(false)
const isFinishable = ref(false)
const isHighPrio = ref(false)

const currentStep = computed(() => steps[stepIndex.value])
const stepNumber = computed(() => stepIndex.value + 1)
const totalSteps = steps.length

const selectModality = (value: Modality) => {
  modality.value = value
  next()
}

const confirmContent = () => {
  if (contentInput.value.trim().length < 3) return
  next()
}

const onIntervalInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  const digits = target.value.replace(/[^0-9]/g, '')
  if (!digits) {
    intervalInput.value = ''
    intervalValid.value = false
    target.value = ''
    return
  }
  const numeric = parseInt(digits, 10)
  intervalInput.value = String(numeric)
  intervalValid.value = numeric >= 1
  target.value = intervalInput.value
}

const confirmInterval = () => {
  if (!intervalValid.value) return
  next()
}

const confirmBoolean = (value: boolean) => {
  if (currentStep.value.key === 'isFinishable') {
    isFinishable.value = value
  } else if (currentStep.value.key === 'isHighPrio') {
    isHighPrio.value = value
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
  if (!modality.value) return
  const interval = intervalValid.value ? parseInt(intervalInput.value, 10) : 1
  await actionService.create({
    modality: modality.value,
    content: contentInput.value.trim(),
    intervalDays: interval,
    isFinishable: isFinishable.value,
    isHighPrio: isHighPrio.value,
    isCompleted: false,
    archived: false,
    createdAt: new Date(),
  })
  router.push({ name: 'list' })
}
</script>
