import { db, type Habit, type Evaluate, type Todo, type QueueItem } from '@/db'

interface BackupData {
  version: string
  timestamp: string
  habits: Habit[]
  evaluates: Evaluate[]
  todos: Todo[]
  queueItems: QueueItem[]
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
      habits,
      evaluates,
      todos,
      queueItems
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
          await db.habits.add({
            ...habitData,
            createdAt: new Date(habitData.createdAt),
            lastCompleted: habitData.lastCompleted ? new Date(habitData.lastCompleted) : undefined
          })
        }

        // Import evaluates
        for (const evaluate of backupData.evaluates) {
          const { id, ...evaluateData } = evaluate
          void id // Ignore unused variable
          await db.evaluates.add({
            ...evaluateData,
            createdAt: new Date(evaluateData.createdAt),
            lastCompleted: evaluateData.lastCompleted ? new Date(evaluateData.lastCompleted) : undefined
          })
        }

        // Import todos
        for (const todo of backupData.todos) {
          const { id, ...todoData } = todo
          void id // Ignore unused variable
          await db.todos.add({
            ...todoData,
            createdAt: new Date(todoData.createdAt),
            completedAt: todoData.completedAt ? new Date(todoData.completedAt) : undefined
          })
        }

        // Import queue items
        for (const queueItem of backupData.queueItems) {
          const { id, ...queueData } = queueItem
          void id // Ignore unused variable
          await db.queueItems.add({
            ...queueData,
            scheduledFor: new Date(queueData.scheduledFor)
          })
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
    if (!data || typeof data !== 'object') return false
    const obj = data as Record<string, unknown>

    return (
      typeof obj.version === 'string' &&
      typeof obj.timestamp === 'string' &&
      Array.isArray(obj.habits) &&
      Array.isArray(obj.evaluates) &&
      Array.isArray(obj.todos) &&
      Array.isArray(obj.queueItems) &&
      obj.habits.every(this.isValidHabit) &&
      obj.evaluates.every(this.isValidEvaluate) &&
      obj.todos.every(this.isValidTodo) &&
      obj.queueItems.every(this.isValidQueueItem)
    )
  }

  private isValidHabit(habit: unknown): habit is Habit {
    if (!habit || typeof habit !== 'object') return false
    const obj = habit as Record<string, unknown>

    return (
      typeof obj.title === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.minFrequencyDays === 'number' &&
      typeof obj.doInstantly === 'boolean' &&
      (obj.createdAt instanceof Date || typeof obj.createdAt === 'string') &&
      (obj.lastCompleted === undefined || obj.lastCompleted instanceof Date || typeof obj.lastCompleted === 'string')
    )
  }

  private isValidEvaluate(evaluate: unknown): evaluate is Evaluate {
    if (!evaluate || typeof evaluate !== 'object') return false
    const obj = evaluate as Record<string, unknown>

    return (
      typeof obj.question === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.minFrequencyDays === 'number' &&
      typeof obj.doInstantly === 'boolean' &&
      (obj.createdAt instanceof Date || typeof obj.createdAt === 'string') &&
      (obj.lastCompleted === undefined || obj.lastCompleted instanceof Date || typeof obj.lastCompleted === 'string')
    )
  }

  private isValidTodo(todo: unknown): todo is Todo {
    if (!todo || typeof todo !== 'object') return false
    const obj = todo as Record<string, unknown>

    return (
      typeof obj.title === 'string' &&
      typeof obj.description === 'string' &&
      typeof obj.doInstantly === 'boolean' &&
      typeof obj.completed === 'boolean' &&
      typeof obj.archived === 'boolean' &&
      (obj.createdAt instanceof Date || typeof obj.createdAt === 'string') &&
      (obj.completedAt === undefined || obj.completedAt instanceof Date || typeof obj.completedAt === 'string')
    )
  }

  private isValidQueueItem(queueItem: unknown): queueItem is QueueItem {
    if (!queueItem || typeof queueItem !== 'object') return false
    const obj = queueItem as Record<string, unknown>

    return (
      (obj.type === 'habit' || obj.type === 'evaluate' || obj.type === 'todo') &&
      typeof obj.itemId === 'number' &&
      typeof obj.completed === 'boolean' &&
      (obj.scheduledFor instanceof Date || typeof obj.scheduledFor === 'string')
    )
  }
}

export const backupService = new BackupService()