import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

// ============================================================================
// Answer Types
// ============================================================================

export interface TextAnswer {
  timestamp: Date
  text: string
}

export interface YesNoAnswer {
  timestamp: Date
  value: 'yes' | 'kind-of' | 'no'
}

export interface TaskAnswer {
  timestamp: Date
  action: 'ok' | 'already-done'
}

// ============================================================================
// Entity Type Discriminators
// ============================================================================

export type EntityType =
  | 'prompt-text'
  | 'prompt-text-high-prio'
  | 'prompt-yes-no'
  | 'daily-task-once'
  | 'daily-task-once-delayed-until'
  | 'daily-task-once-delayed-by-days'
  | 'daily-task-repeated'
  | 'daily-task-repeated-delayed-until'
  | 'daily-task-repeated-delayed-by-days'

// ============================================================================
// Entity Interfaces
// ============================================================================

export interface PromptText {
  id?: string
  type: 'prompt-text'
  prompt: string
  interval: number
  createdAt: Date
  lastShownAt?: Date
  answers: TextAnswer[]
}

export interface PromptTextHighPrio {
  id?: string
  type: 'prompt-text-high-prio'
  prompt: string
  createdAt: Date
  lastShownAt?: Date
  answers: TextAnswer[]
}

export interface PromptYesOrNo {
  id?: string
  type: 'prompt-yes-no'
  question: string
  interval: number
  createdAt: Date
  lastShownAt?: Date
  answers: YesNoAnswer[]
}

export interface DailyTaskOnce {
  id?: string
  type: 'daily-task-once'
  content: string
  isDone: boolean
  createdAt: Date
  lastShownAt?: Date
  answers: TaskAnswer[]
}

export interface DailyTaskOnceDelayedUntil {
  id?: string
  type: 'daily-task-once-delayed-until'
  content: string
  isDone: boolean
  startAtDate: string // yy-mm-dd format
  createdAt: Date
  lastShownAt?: Date
  answers: TaskAnswer[]
}

export interface DailyTaskOnceDelayedByDays {
  id?: string
  type: 'daily-task-once-delayed-by-days'
  content: string
  isDone: boolean
  startInDays: number
  createdAt: Date
  lastShownAt?: Date
  answers: TaskAnswer[]
}

export interface DailyTaskRepeated {
  id?: string
  type: 'daily-task-repeated'
  content: string
  interval: number
  createdAt: Date
  lastShownAt?: Date
  answers: TaskAnswer[]
}

export interface DailyTaskRepeatedDelayedUntil {
  id?: string
  type: 'daily-task-repeated-delayed-until'
  content: string
  interval: number
  startAtDate: string // yy-mm-dd format
  createdAt: Date
  lastShownAt?: Date
  answers: TaskAnswer[]
}

export interface DailyTaskRepeatedDelayedByDays {
  id?: string
  type: 'daily-task-repeated-delayed-by-days'
  content: string
  interval: number
  startInDays: number
  createdAt: Date
  lastShownAt?: Date
  answers: TaskAnswer[]
}

// ============================================================================
// Task of the Day
// ============================================================================

export interface TaskOfTheDay {
  id?: string
  date: string // yyyy-mm-dd format
  taskId: string
  taskType: EntityType
  selectedAt: Date
  completedAt?: Date
}

// ============================================================================
// Union Type for All Entities
// ============================================================================

export type Entity =
  | PromptText
  | PromptTextHighPrio
  | PromptYesOrNo
  | DailyTaskOnce
  | DailyTaskOnceDelayedUntil
  | DailyTaskOnceDelayedByDays
  | DailyTaskRepeated
  | DailyTaskRepeatedDelayedUntil
  | DailyTaskRepeatedDelayedByDays

// ============================================================================
// Database Definition
// ============================================================================

const db = new Dexie('HabitTrackerDB', { addons: [dexieCloud] }) as Dexie & {
  promptsText: EntityTable<PromptText, 'id'>
  promptsTextHighPrio: EntityTable<PromptTextHighPrio, 'id'>
  promptsYesOrNo: EntityTable<PromptYesOrNo, 'id'>
  dailyTasksOnce: EntityTable<DailyTaskOnce, 'id'>
  dailyTasksOnceDelayedUntil: EntityTable<DailyTaskOnceDelayedUntil, 'id'>
  dailyTasksOnceDelayedByDays: EntityTable<DailyTaskOnceDelayedByDays, 'id'>
  dailyTasksRepeated: EntityTable<DailyTaskRepeated, 'id'>
  dailyTasksRepeatedDelayedUntil: EntityTable<DailyTaskRepeatedDelayedUntil, 'id'>
  dailyTasksRepeatedDelayedByDays: EntityTable<DailyTaskRepeatedDelayedByDays, 'id'>
  taskOfTheDay: EntityTable<TaskOfTheDay, 'id'>
  cloud: {
    configure: (config: { databaseUrl: string; requireAuth: boolean; customLoginGui: boolean }) => void
    currentUser: { email?: string } | null
    login: () => Promise<void>
    logout: () => Promise<void>
    userInteraction: { subscribe: (callback: (interaction: unknown) => void) => { unsubscribe: () => void } }
  }
}

// Version 2: New entity-based schema (fresh start, no migration)
db.version(2).stores({
  promptsText: '@id, createdAt, lastShownAt',
  promptsTextHighPrio: '@id, createdAt, lastShownAt',
  promptsYesOrNo: '@id, createdAt, lastShownAt',
  dailyTasksOnce: '@id, createdAt, lastShownAt, isDone',
  dailyTasksOnceDelayedUntil: '@id, createdAt, lastShownAt, isDone, startAtDate',
  dailyTasksOnceDelayedByDays: '@id, createdAt, lastShownAt, isDone, startInDays',
  dailyTasksRepeated: '@id, createdAt, lastShownAt',
  dailyTasksRepeatedDelayedUntil: '@id, createdAt, lastShownAt, startAtDate',
  dailyTasksRepeatedDelayedByDays: '@id, createdAt, lastShownAt, startInDays'
})

// Version 3: Add task-of-the-day table
db.version(3).stores({
  promptsText: '@id, createdAt, lastShownAt',
  promptsTextHighPrio: '@id, createdAt, lastShownAt',
  promptsYesOrNo: '@id, createdAt, lastShownAt',
  dailyTasksOnce: '@id, createdAt, lastShownAt, isDone',
  dailyTasksOnceDelayedUntil: '@id, createdAt, lastShownAt, isDone, startAtDate',
  dailyTasksOnceDelayedByDays: '@id, createdAt, lastShownAt, isDone, startInDays',
  dailyTasksRepeated: '@id, createdAt, lastShownAt',
  dailyTasksRepeatedDelayedUntil: '@id, createdAt, lastShownAt, startAtDate',
  dailyTasksRepeatedDelayedByDays: '@id, createdAt, lastShownAt, startInDays',
  taskOfTheDay: '@id, date'
})

// Configure Dexie Cloud
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false, // Make login optional
  customLoginGui: true // Use our custom login GUI in SettingsView
})

export { db }
