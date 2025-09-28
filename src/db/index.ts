import Dexie, { type EntityTable } from 'dexie'

export interface Habit {
  id?: number
  title: string
  minFrequencyDays: number
  isHighPrio: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Evaluate {
  id?: number
  question: string
  minFrequencyDays: number
  isHighPrio: boolean
  lastCompleted?: Date
  createdAt: Date
}

export interface Todo {
  id?: number
  title: string
  isHighPrio: boolean
  completed: boolean
  archived: boolean
  createdAt: Date
  completedAt?: Date
}

const db = new Dexie('HabitTrackerDB') as Dexie & {
  habits: EntityTable<Habit, 'id'>
  evaluates: EntityTable<Evaluate, 'id'>
  todos: EntityTable<Todo, 'id'>
}

db.version(1).stores({
  habits: '++id, title, createdAt, lastCompleted, isHighPrio',
  evaluates: '++id, question, createdAt, lastCompleted, isHighPrio',
  todos: '++id, title, createdAt, completed, archived, isHighPrio'
})

export { db }