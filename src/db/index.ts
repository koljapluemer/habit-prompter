import Dexie, { type EntityTable } from 'dexie'
import dexieCloud from 'dexie-cloud-addon'

export interface Habit {
  id?: string
  title: string
  minFrequencyDays: number
  isHighPrio: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Evaluate {
  id?: string
  question: string
  minFrequencyDays: number
  isHighPrio: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Todo {
  id?: string
  title: string
  isHighPrio: boolean
  completed: boolean
  archived: boolean
  createdAt: Date
  completedAt?: Date
}

const db = new Dexie('HabitTrackerDB', { addons: [dexieCloud] }) as Dexie & {
  habits: EntityTable<Habit, 'id'>
  evaluates: EntityTable<Evaluate, 'id'>
  todos: EntityTable<Todo, 'id'>
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
  habits: '@id, title, createdAt, lastCompleted, isHighPrio',
  evaluates: '@id, question, createdAt, lastCompleted, isHighPrio',
  todos: '@id, title, createdAt, completed, archived, isHighPrio'
})

// Configure Dexie Cloud
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false  // Make login optional
})

export { db }