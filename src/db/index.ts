import Dexie, { type EntityTable } from 'dexie'

export interface Habit {
  id?: number
  title: string
  description: string
  minFrequencyDays: number
  isHighPrio: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Evaluate {
  id?: number
  question: string
  description: string
  minFrequencyDays: number
  isHighPrio: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Todo {
  id?: number
  title: string
  description: string
  isHighPrio: boolean
  completed: boolean
  archived: boolean
  createdAt: Date
  completedAt?: Date
}

export interface QueueItem {
  id?: number
  type: 'habit' | 'evaluate' | 'todo'
  itemId: number
  scheduledFor: Date
  completed: boolean
  response?: string // For evaluation responses
}

const db = new Dexie('HabitTrackerDB') as Dexie & {
  habits: EntityTable<Habit, 'id'>
  evaluates: EntityTable<Evaluate, 'id'>
  todos: EntityTable<Todo, 'id'>
  queueItems: EntityTable<QueueItem, 'id'>
}

db.version(1).stores({
  habits: '++id, title, createdAt, lastCompleted',
  evaluates: '++id, question, createdAt, lastCompleted',
  todos: '++id, title, createdAt, completed, archived',
  queueItems: '++id, type, itemId, scheduledFor, completed'
})

db.version(2).stores({
  habits: '++id, title, createdAt, lastCompleted, isHighPrio',
  evaluates: '++id, question, createdAt, lastCompleted, isHighPrio',
  todos: '++id, title, createdAt, completed, archived, isHighPrio',
  queueItems: '++id, type, itemId, scheduledFor, completed'
}).upgrade(trans => {
  // Set default isHighPrio to false for existing records and remove doInstantly
  return Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trans as any).habits.toCollection().modify((habit: any) => {
      habit.isHighPrio = false
      delete habit.doInstantly
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trans as any).evaluates.toCollection().modify((evaluate: any) => {
      evaluate.isHighPrio = false
      delete evaluate.doInstantly
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (trans as any).todos.toCollection().modify((todo: any) => {
      todo.isHighPrio = false
      delete todo.doInstantly
    })
  ])
})

export { db }