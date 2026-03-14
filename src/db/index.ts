import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

export interface TextAnswer {
  timestamp: Date
  text: string
}

export interface Prompt {
  id?: string
  prompt: string
  interval: number
  createdAt: Date
  lastShownAt?: Date
  answers: TextAnswer[]
}

// ============================================================================
// Database Definition
// ============================================================================

const db = new Dexie('HabitTrackerDB', { addons: [dexieCloud] }) as Dexie & {
  prompts: EntityTable<Prompt, 'id'>
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

// Version 5: Unify all entity types into a single prompts table
db.version(5)
  .stores({
    prompts: '@id, createdAt, lastShownAt',
    promptsText: null,
    promptsTextHighPrio: null,
    promptsYesOrNo: null
  })
  .upgrade(async tx => {
    const [texts, highPrios, yesNos] = await Promise.all([
      tx.table('promptsText').toArray(),
      tx.table('promptsTextHighPrio').toArray(),
      tx.table('promptsYesOrNo').toArray()
    ])

    await tx.table('prompts').bulkAdd([
      ...texts.map((e: any) => ({
        id: e.id,
        prompt: e.prompt,
        interval: e.interval,
        createdAt: e.createdAt,
        lastShownAt: e.lastShownAt,
        answers: e.answers
      })),
      ...highPrios.map((e: any) => ({
        id: e.id,
        prompt: e.prompt,
        interval: 1,
        createdAt: e.createdAt,
        lastShownAt: e.lastShownAt,
        answers: e.answers
      })),
      ...yesNos.map((e: any) => ({
        id: e.id,
        prompt: e.question,
        interval: e.interval,
        createdAt: e.createdAt,
        lastShownAt: e.lastShownAt,
        answers: e.answers.map((a: any) => ({ timestamp: a.timestamp, text: a.value }))
      }))
    ])
  })

// Configure Dexie Cloud
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false, // Make login optional
  customLoginGui: true // Use our custom login GUI in SettingsView
})

export { db }
