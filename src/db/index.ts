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
  cloud: any
}

db.version(1).stores({
  habits: '++id, title, createdAt, lastCompleted, isHighPrio',
  evaluates: '++id, question, createdAt, lastCompleted, isHighPrio',
  todos: '++id, title, createdAt, completed, archived, isHighPrio'
})

// Version 2: Migrate to Dexie Cloud with string IDs
db.version(2).stores({
  habits: '@id, title, createdAt, lastCompleted, isHighPrio',
  evaluates: '@id, question, createdAt, lastCompleted, isHighPrio',
  todos: '@id, title, createdAt, completed, archived, isHighPrio'
}).upgrade(async tx => {
  // Migration function to convert numeric IDs to string IDs
  const migrateTable = async (table: any) => {
    const items = await table.toArray()
    await table.clear()

    // Re-add items without id (let @id auto-generate string IDs)
    const itemsWithoutId = items.map((item: any) => {
      const { id, ...rest } = item
      return rest
    })

    await table.bulkAdd(itemsWithoutId)
  }

  await Promise.all([
    migrateTable(tx.table('habits')),
    migrateTable(tx.table('evaluates')),
    migrateTable(tx.table('todos'))
  ])
})

// Configure Dexie Cloud
db.cloud.configure({
  databaseUrl: import.meta.env.VITE_DEXIE_CLOUD_URL,
  requireAuth: false  // Make login optional
})

export { db }