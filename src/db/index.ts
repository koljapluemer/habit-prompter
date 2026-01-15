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

// ============================================================================
// Entity Type Discriminators
// ============================================================================

export type EntityType =
  | 'prompt-text'
  | 'prompt-text-high-prio'
  | 'prompt-yes-no'

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

// ============================================================================
// Union Type for All Entities
// ============================================================================

export type Entity =
  | PromptText
  | PromptTextHighPrio
  | PromptYesOrNo

// ============================================================================
// Database Definition
// ============================================================================

const db = new Dexie('HabitTrackerDB', { addons: [dexieCloud] }) as Dexie & {
  promptsText: EntityTable<PromptText, 'id'>
  promptsTextHighPrio: EntityTable<PromptTextHighPrio, 'id'>
  promptsYesOrNo: EntityTable<PromptYesOrNo, 'id'>
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

// Version 4: Remove daily task tables
db.version(4).stores({
  promptsText: '@id, createdAt, lastShownAt',
  promptsTextHighPrio: '@id, createdAt, lastShownAt',
  promptsYesOrNo: '@id, createdAt, lastShownAt',
  dailyTasksOnce: null,
  dailyTasksOnceDelayedUntil: null,
  dailyTasksOnceDelayedByDays: null,
  dailyTasksRepeated: null,
  dailyTasksRepeatedDelayedUntil: null,
  dailyTasksRepeatedDelayedByDays: null,
  taskOfTheDay: null
})

// Configure Dexie Cloud
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false, // Make login optional
  customLoginGui: true // Use our custom login GUI in SettingsView
})

export { db }
