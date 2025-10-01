import { db, type Habit, type Evaluate, type Todo } from '@/db'

export const habitService = {
  async getAll(): Promise<Habit[]> {
    return await db.habits.orderBy('createdAt').reverse().toArray()
  },

  async create(habit: Omit<Habit, 'id'>): Promise<number> {
    const id = await db.habits.add(habit)
    return id as number
  },

  async update(id: number, changes: Partial<Habit>): Promise<void> {
    await db.habits.update(id, changes)
  },

  async delete(id: number): Promise<void> {
    await db.habits.delete(id)
  },

  async markCompleted(id: number): Promise<void> {
    await db.habits.update(id, { lastCompleted: new Date() })
  },

  async getNeedingCompletion(): Promise<Habit[]> {
    const habits = await db.habits.toArray()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return habits.filter(habit => {
      if (!habit.lastCompleted) return true
      const lastCompletedDate = new Date(habit.lastCompleted)
      lastCompletedDate.setHours(0, 0, 0, 0)
      const daysSinceCompletion = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceCompletion >= habit.minFrequencyDays
    })
  }
}

export const evaluateService = {
  async getAll(): Promise<Evaluate[]> {
    return await db.evaluates.orderBy('createdAt').reverse().toArray()
  },

  async create(evaluate: Omit<Evaluate, 'id'>): Promise<number> {
    const id = await db.evaluates.add(evaluate)
    return id as number
  },

  async update(id: number, changes: Partial<Evaluate>): Promise<void> {
    await db.evaluates.update(id, changes)
  },

  async delete(id: number): Promise<void> {
    await db.evaluates.delete(id)
  },

  async markCompleted(id: number): Promise<void> {
    await db.evaluates.update(id, { lastCompleted: new Date() })
  },

  async getNeedingCompletion(): Promise<Evaluate[]> {
    const evaluates = await db.evaluates.toArray()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return evaluates.filter(evaluate => {
      if (!evaluate.lastCompleted) return true
      const lastCompletedDate = new Date(evaluate.lastCompleted)
      lastCompletedDate.setHours(0, 0, 0, 0)
      const daysSinceCompletion = Math.floor((today.getTime() - lastCompletedDate.getTime()) / (1000 * 60 * 60 * 24))
      return daysSinceCompletion >= evaluate.minFrequencyDays
    })
  }
}

export const todoService = {
  async getAll(): Promise<Todo[]> {
    return await db.todos.orderBy('createdAt').reverse().toArray()
  },

  async getActive(): Promise<Todo[]> {
    return await db.todos.where('completed').equals(0).and(todo => !todo.archived).toArray()
  },

  async getCompleted(): Promise<Todo[]> {
    return await db.todos.where('completed').equals(1).toArray()
  },

  async create(todo: Omit<Todo, 'id'>): Promise<number> {
    const id = await db.todos.add(todo)
    return id as number
  },

  async update(id: number, changes: Partial<Todo>): Promise<void> {
    await db.todos.update(id, changes)
  },

  async delete(id: number): Promise<void> {
    await db.todos.delete(id)
  },

  async markCompleted(id: number): Promise<void> {
    await db.todos.update(id, { completed: true, completedAt: new Date() })
  },

  async markArchived(id: number): Promise<void> {
    await db.todos.update(id, { archived: true })
  }
}

