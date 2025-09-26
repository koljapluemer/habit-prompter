import { db, type Habit, type Evaluate, type Todo, type QueueItem } from '@/db'

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
    await db.queueItems.where('itemId').equals(id).and(item => item.type === 'habit').delete()
  },

  async markCompleted(id: number): Promise<void> {
    await db.habits.update(id, { lastCompleted: new Date() })
  },

  async getNeedingCompletion(): Promise<Habit[]> {
    const habits = await db.habits.toArray()
    const now = new Date()
    return habits.filter(habit => {
      if (!habit.lastCompleted) return true
      const daysSinceCompletion = Math.floor((now.getTime() - habit.lastCompleted.getTime()) / (1000 * 60 * 60 * 24))
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
    await db.queueItems.where('itemId').equals(id).and(item => item.type === 'evaluate').delete()
  },

  async markCompleted(id: number): Promise<void> {
    await db.evaluates.update(id, { lastCompleted: new Date() })
  },

  async getNeedingCompletion(): Promise<Evaluate[]> {
    const evaluates = await db.evaluates.toArray()
    const now = new Date()
    return evaluates.filter(evaluate => {
      if (!evaluate.lastCompleted) return true
      const daysSinceCompletion = Math.floor((now.getTime() - evaluate.lastCompleted.getTime()) / (1000 * 60 * 60 * 24))
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
    await db.queueItems.where('itemId').equals(id).and(item => item.type === 'todo').delete()
  },

  async markCompleted(id: number): Promise<void> {
    await db.todos.update(id, { completed: true, completedAt: new Date() })
  },

  async markArchived(id: number): Promise<void> {
    await db.todos.update(id, { archived: true })
  }
}

export const queueService = {
  async getAll(): Promise<QueueItem[]> {
    return await db.queueItems.orderBy('scheduledFor').toArray()
  },

  async getForDate(date: Date): Promise<QueueItem[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    return await db.queueItems
      .where('scheduledFor')
      .between(startOfDay, endOfDay)
      .toArray()
  },

  async create(queueItem: Omit<QueueItem, 'id'>): Promise<number> {
    const id = await db.queueItems.add(queueItem)
    return id as number
  },

  async markCompleted(id: number, response?: string): Promise<void> {
    const updateData: Partial<QueueItem> = { completed: true }
    if (response) {
      updateData.response = response
    }
    await db.queueItems.update(id, updateData)
  },

  async delete(id: number): Promise<void> {
    await db.queueItems.delete(id)
  },

  async generateQueueForDate(date: Date, maxItems: number = 5): Promise<void> {
    const existingItems = await this.getForDate(date)
    if (existingItems.length >= maxItems) return

    const neededItems = maxItems - existingItems.length
    const availableItems: Array<{
      type: 'habit' | 'evaluate' | 'todo'
      item: Habit | Evaluate | Todo
    }> = []

    const needingHabits = await habitService.getNeedingCompletion()
    const needingEvaluates = await evaluateService.getNeedingCompletion()
    const activeTodos = await todoService.getActive()

    needingHabits.forEach(habit => availableItems.push({ type: 'habit' as const, item: habit }))
    needingEvaluates.forEach(evaluate => availableItems.push({ type: 'evaluate' as const, item: evaluate }))
    activeTodos.forEach(todo => availableItems.push({ type: 'todo' as const, item: todo }))

    // Separate high priority and normal priority items
    const highPriorityItems = availableItems.filter(item => item.item.isHighPrio)
    const normalPriorityItems = availableItems.filter(item => !item.item.isHighPrio)

    // Shuffle each group separately
    const shuffledHighPrio = highPriorityItems.sort(() => Math.random() - 0.5)
    const shuffledNormal = normalPriorityItems.sort(() => Math.random() - 0.5)

    // Prioritize high priority items first, then normal priority items
    const prioritizedItems = [...shuffledHighPrio, ...shuffledNormal]
    const selected = prioritizedItems.slice(0, neededItems)

    for (const { type, item } of selected) {
      await this.create({
        type,
        itemId: item.id!,
        scheduledFor: date,
        completed: false
      })
    }
  }
}