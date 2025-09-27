import { db, type Habit, type Evaluate, type Todo, type QueueItem } from '@/db'

interface BackupData {
  version: string
  timestamp: string
  habits: Array<Omit<Habit, 'createdAt' | 'lastCompleted'> & {
    createdAt: string
    lastCompleted?: string
  }>
  evaluates: Array<Omit<Evaluate, 'createdAt' | 'lastCompleted'> & {
    createdAt: string
    lastCompleted?: string
  }>
  todos: Array<Omit<Todo, 'createdAt' | 'completedAt'> & {
    createdAt: string
    completedAt?: string
  }>
  queueItems: Array<Omit<QueueItem, 'scheduledFor'> & {
    scheduledFor: string
  }>
}

interface BackupStats {
  habits: number
  evaluates: number
  todos: number
  queueItems: number
  databaseSize: string
}

class BackupService {
  async exportData(): Promise<string> {
    const habits = await db.habits.toArray()
    const evaluates = await db.evaluates.toArray()
    const todos = await db.todos.toArray()
    const queueItems = await db.queueItems.toArray()

    const backupData: BackupData = {
      version: '2.0',
      timestamp: new Date().toISOString(),
      habits: habits.map(habit => ({
        ...habit,
        createdAt: habit.createdAt.toISOString(),
        lastCompleted: habit.lastCompleted?.toISOString()
      })),
      evaluates: evaluates.map(evaluate => ({
        ...evaluate,
        createdAt: evaluate.createdAt.toISOString(),
        lastCompleted: evaluate.lastCompleted?.toISOString()
      })),
      todos: todos.map(todo => ({
        ...todo,
        createdAt: todo.createdAt.toISOString(),
        completedAt: todo.completedAt?.toISOString()
      })),
      queueItems: queueItems.map(queueItem => ({
        ...queueItem,
        scheduledFor: queueItem.scheduledFor.toISOString()
      }))
    }

    return JSON.stringify(backupData, null, 2)
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const backupData: BackupData = JSON.parse(jsonData)

      if (!this.validateBackupData(backupData)) {
        throw new Error('Invalid backup data format')
      }

      // Clear existing data
      await db.transaction('rw', [db.habits, db.evaluates, db.todos, db.queueItems], async () => {
        await db.habits.clear()
        await db.evaluates.clear()
        await db.todos.clear()
        await db.queueItems.clear()

        // Import habits
        for (const habit of backupData.habits) {
          const { id, ...habitData } = habit
          void id // Ignore unused variable

          try {
            await db.habits.add({
              title: habitData.title,
              minFrequencyDays: habitData.minFrequencyDays,
              isHighPrio: habitData.isHighPrio,
              createdAt: new Date(habitData.createdAt),
              lastCompleted: habitData.lastCompleted ? new Date(habitData.lastCompleted) : undefined
            })
          } catch (error) {
            console.error('Failed to import habit:', habitData, error)
            throw error
          }
        }

        // Import evaluates
        for (const evaluate of backupData.evaluates) {
          const { id, ...evaluateData } = evaluate
          void id // Ignore unused variable

          try {
            await db.evaluates.add({
              question: evaluateData.question,
              minFrequencyDays: evaluateData.minFrequencyDays,
              isHighPrio: evaluateData.isHighPrio,
              createdAt: new Date(evaluateData.createdAt),
              lastCompleted: evaluateData.lastCompleted ? new Date(evaluateData.lastCompleted) : undefined
            })
          } catch (error) {
            console.error('Failed to import evaluate:', evaluateData, error)
            throw error
          }
        }

        // Import todos
        for (const todo of backupData.todos) {
          const { id, ...todoData } = todo
          void id // Ignore unused variable

          try {
            await db.todos.add({
              title: todoData.title,
              isHighPrio: todoData.isHighPrio,
              completed: todoData.completed,
              archived: todoData.archived,
              createdAt: new Date(todoData.createdAt),
              completedAt: todoData.completedAt ? new Date(todoData.completedAt) : undefined
            })
          } catch (error) {
            console.error('Failed to import todo:', todoData, error)
            throw error
          }
        }

        // Import queue items
        for (const queueItem of backupData.queueItems) {
          const { id, ...queueData } = queueItem
          void id // Ignore unused variable

          try {
            await db.queueItems.add({
              type: queueData.type,
              itemId: queueData.itemId,
              completed: queueData.completed,
              scheduledFor: new Date(queueData.scheduledFor),
              response: queueData.response
            })
          } catch (error) {
            console.error('Failed to import queue item:', queueData, error)
            throw error
          }
        }
      })

    } catch (error) {
      console.error('Import failed:', error)
      throw new Error('Failed to import backup data')
    }
  }

  async exportToFile(): Promise<void> {
    const jsonData = await this.exportData()
    const blob = new Blob([jsonData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  async importFromFile(file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string
          await this.importData(jsonData)
          resolve()
        } catch (error) {
          reject(error)
        }
      }

      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  async getStats(): Promise<BackupStats> {
    const habitCount = await db.habits.count()
    const evaluateCount = await db.evaluates.count()
    const todoCount = await db.todos.count()
    const queueItemCount = await db.queueItems.count()

    // Estimate database size
    const sampleData = await this.exportData()
    const sizeInBytes = new Blob([sampleData]).size
    const sizeInKB = Math.round(sizeInBytes / 1024)

    let sizeString = `${sizeInKB} KB`
    if (sizeInKB > 1024) {
      const sizeInMB = Math.round(sizeInKB / 1024 * 10) / 10
      sizeString = `${sizeInMB} MB`
    }

    return {
      habits: habitCount,
      evaluates: evaluateCount,
      todos: todoCount,
      queueItems: queueItemCount,
      databaseSize: sizeString
    }
  }

  private validateBackupData(data: unknown): data is BackupData {
    if (!data || typeof data !== 'object') {
      console.error('Backup data is not an object:', typeof data)
      return false
    }
    const obj = data as Record<string, unknown>

    console.log('Validating backup data structure:', {
      hasVersion: typeof obj.version === 'string',
      hasTimestamp: typeof obj.timestamp === 'string',
      hasHabits: Array.isArray(obj.habits),
      hasEvaluates: Array.isArray(obj.evaluates),
      hasTodos: Array.isArray(obj.todos),
      hasQueueItems: Array.isArray(obj.queueItems),
      habitsCount: Array.isArray(obj.habits) ? obj.habits.length : 'N/A',
      evaluatesCount: Array.isArray(obj.evaluates) ? obj.evaluates.length : 'N/A',
      todosCount: Array.isArray(obj.todos) ? obj.todos.length : 'N/A',
      queueItemsCount: Array.isArray(obj.queueItems) ? obj.queueItems.length : 'N/A'
    })

    if (typeof obj.version !== 'string') {
      console.error('Missing or invalid version')
      return false
    }
    if (typeof obj.timestamp !== 'string') {
      console.error('Missing or invalid timestamp')
      return false
    }
    if (!Array.isArray(obj.habits)) {
      console.error('Missing or invalid habits array')
      return false
    }
    if (!Array.isArray(obj.evaluates)) {
      console.error('Missing or invalid evaluates array')
      return false
    }
    if (!Array.isArray(obj.todos)) {
      console.error('Missing or invalid todos array')
      return false
    }
    if (!Array.isArray(obj.queueItems)) {
      console.error('Missing or invalid queueItems array')
      return false
    }

    // Validate each habit
    for (let i = 0; i < obj.habits.length; i++) {
      if (!this.isValidHabit(obj.habits[i])) {
        console.error(`Invalid habit at index ${i}:`, obj.habits[i])
        return false
      }
    }

    // Validate each evaluate
    for (let i = 0; i < obj.evaluates.length; i++) {
      if (!this.isValidEvaluate(obj.evaluates[i])) {
        console.error(`Invalid evaluate at index ${i}:`, obj.evaluates[i])
        return false
      }
    }

    // Validate each todo
    for (let i = 0; i < obj.todos.length; i++) {
      if (!this.isValidTodo(obj.todos[i])) {
        console.error(`Invalid todo at index ${i}:`, obj.todos[i])
        return false
      }
    }

    // Validate each queue item
    for (let i = 0; i < obj.queueItems.length; i++) {
      if (!this.isValidQueueItem(obj.queueItems[i])) {
        console.error(`Invalid queue item at index ${i}:`, obj.queueItems[i])
        return false
      }
    }

    return true
  }

  private isValidHabit(habit: unknown): habit is Habit {
    if (!habit || typeof habit !== 'object') {
      console.error('Habit is not an object:', habit)
      return false
    }
    const obj = habit as Record<string, unknown>

    const checks = {
      title: typeof obj.title === 'string',
      minFrequencyDays: typeof obj.minFrequencyDays === 'number',
      isHighPrio: typeof obj.isHighPrio === 'boolean',
      createdAt: obj.createdAt instanceof Date || typeof obj.createdAt === 'string',
      lastCompleted: obj.lastCompleted === undefined || obj.lastCompleted instanceof Date || typeof obj.lastCompleted === 'string'
    }

    const isValid = Object.values(checks).every(Boolean)
    if (!isValid) {
      console.error('Invalid habit fields:', checks, 'Habit data:', obj)
    }

    return isValid
  }

  private isValidEvaluate(evaluate: unknown): evaluate is Evaluate {
    if (!evaluate || typeof evaluate !== 'object') {
      console.error('Evaluate is not an object:', evaluate)
      return false
    }
    const obj = evaluate as Record<string, unknown>

    const checks = {
      question: typeof obj.question === 'string',
      minFrequencyDays: typeof obj.minFrequencyDays === 'number',
      isHighPrio: typeof obj.isHighPrio === 'boolean',
      createdAt: obj.createdAt instanceof Date || typeof obj.createdAt === 'string',
      lastCompleted: obj.lastCompleted === undefined || obj.lastCompleted instanceof Date || typeof obj.lastCompleted === 'string'
    }

    const isValid = Object.values(checks).every(Boolean)
    if (!isValid) {
      console.error('Invalid evaluate fields:', checks, 'Evaluate data:', obj)
    }

    return isValid
  }

  private isValidTodo(todo: unknown): todo is Todo {
    if (!todo || typeof todo !== 'object') {
      console.error('Todo is not an object:', todo)
      return false
    }
    const obj = todo as Record<string, unknown>

    const checks = {
      title: typeof obj.title === 'string',
      isHighPrio: typeof obj.isHighPrio === 'boolean',
      completed: typeof obj.completed === 'boolean',
      archived: typeof obj.archived === 'boolean',
      createdAt: obj.createdAt instanceof Date || typeof obj.createdAt === 'string',
      completedAt: obj.completedAt === undefined || obj.completedAt instanceof Date || typeof obj.completedAt === 'string'
    }

    const isValid = Object.values(checks).every(Boolean)
    if (!isValid) {
      console.error('Invalid todo fields:', checks, 'Todo data:', obj)
    }

    return isValid
  }

  private isValidQueueItem(queueItem: unknown): queueItem is QueueItem {
    if (!queueItem || typeof queueItem !== 'object') {
      console.error('QueueItem is not an object:', queueItem)
      return false
    }
    const obj = queueItem as Record<string, unknown>

    const checks = {
      type: obj.type === 'habit' || obj.type === 'evaluate' || obj.type === 'todo',
      itemId: typeof obj.itemId === 'number',
      completed: typeof obj.completed === 'boolean',
      scheduledFor: obj.scheduledFor instanceof Date || typeof obj.scheduledFor === 'string'
    }

    const isValid = Object.values(checks).every(Boolean)
    if (!isValid) {
      console.error('Invalid queue item fields:', checks, 'QueueItem data:', obj)
    }

    return isValid
  }
}

export const backupService = new BackupService()