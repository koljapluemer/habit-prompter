import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

export type Modality = 'do' | 'schedule' | 'answer' | 'yes-no' | 'one-to-ten'

export interface Action {
  id?: string
  content: string
  modality: Modality
  intervalDays: number
  isHighPrio: boolean
  isFinishable: boolean
  isCompleted: boolean
  archived: boolean
  createdAt: Date
  lastCompleted?: Date
  completedAt?: Date
}

const db = new Dexie('HabitTrackerDB', { addons: [dexieCloud] }) as Dexie & {
  actions: EntityTable<Action, 'id'>
  cloud: {
    configure: (config: { databaseUrl: string; requireAuth: boolean; customLoginGui: boolean }) => void
    currentUser: { email?: string } | null
    login: () => Promise<void>
    logout: () => Promise<void>
    userInteraction: { subscribe: (callback: (interaction: unknown) => void) => { unsubscribe: () => void } }
  }
}

// Dexie Cloud requires string IDs, so we start fresh
db.version(1).stores({
  actions: '@id, createdAt, lastCompleted, isHighPrio, isFinishable, isCompleted, archived'
})

// Configure Dexie Cloud
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false, // Make login optional
  customLoginGui: true // Use our custom login GUI in SettingsView
})

export { db }
