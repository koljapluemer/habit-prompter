import Dexie, { type EntityTable } from 'dexie'

export interface Habit {
  id?: number
  title: string
  description: string
  minFrequencyDays: number
  doInstantly: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Evaluate {
  id?: number
  question: string
  description: string
  minFrequencyDays: number
  doInstantly: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Todo {
  id?: number
  title: string
  description: string
  doInstantly: boolean
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

export { db }