import { db } from '@/db'
import type { TaskOfTheDay, Entity, EntityType } from '@/db'
import { getHabitDay, formatDateKey } from './entities/utils'
import { entityService } from './database'

export interface TaskOfTheDayResult {
  task: Entity | null
  isCompleted: boolean
  taskOfTheDayRecord: TaskOfTheDay | null
}

/**
 * Get the current task of the day, or select a new one if needed
 */
export const getCurrentTaskOfTheDay = async (): Promise<TaskOfTheDayResult> => {
  // Clean up old records first
  await cleanupOldRecords()

  // Get today's date key (with 4am boundary)
  const today = getHabitDay(new Date())
  const dateKey = formatDateKey(today)

  // Check if we already have a task for today
  const existing = await db.taskOfTheDay
    .where('date')
    .equals(dateKey)
    .first()

  if (existing) {
    // We have a task selected for today
    const task = await findTaskById(existing.taskId, existing.taskType)

    return {
      task,
      isCompleted: !!existing.completedAt,
      taskOfTheDayRecord: existing
    }
  }

  // No task selected yet, pick one randomly
  const candidates = await entityService.getAllDueCandidates()
  const allDailyTasks = candidates.dailyTasks

  if (allDailyTasks.length === 0) {
    return {
      task: null,
      isCompleted: false,
      taskOfTheDayRecord: null
    }
  }

  // Randomly select one task
  const randomIndex = Math.floor(Math.random() * allDailyTasks.length)
  const selectedTask = allDailyTasks[randomIndex]

  // Store the selection in the database
  const newRecord: TaskOfTheDay = {
    date: dateKey,
    taskId: selectedTask.id!,
    taskType: selectedTask.type,
    selectedAt: new Date(),
    completedAt: undefined
  }

  await db.taskOfTheDay.add(newRecord)

  return {
    task: selectedTask,
    isCompleted: false,
    taskOfTheDayRecord: newRecord
  }
}

/**
 * Mark the current task of the day as completed
 */
export const markTaskCompleted = async (): Promise<void> => {
  const today = getHabitDay(new Date())
  const dateKey = formatDateKey(today)

  const record = await db.taskOfTheDay
    .where('date')
    .equals(dateKey)
    .first()

  if (record && record.id) {
    await db.taskOfTheDay.update(record.id, {
      completedAt: new Date()
    })
  }
}

/**
 * Clean up task-of-the-day records older than today
 */
export const cleanupOldRecords = async (): Promise<void> => {
  const today = getHabitDay(new Date())
  const dateKey = formatDateKey(today)

  // Get all records
  const allRecords = await db.taskOfTheDay.toArray()

  // Delete records with date < today
  for (const record of allRecords) {
    if (record.date < dateKey && record.id) {
      await db.taskOfTheDay.delete(record.id)
    }
  }
}

/**
 * Find a task by ID and type from the appropriate table
 */
const findTaskById = async (taskId: string, taskType: EntityType): Promise<Entity | null> => {
  switch (taskType) {
    case 'daily-task-once':
      return await db.dailyTasksOnce.get(taskId) || null
    case 'daily-task-once-delayed-until':
      return await db.dailyTasksOnceDelayedUntil.get(taskId) || null
    case 'daily-task-once-delayed-by-days':
      return await db.dailyTasksOnceDelayedByDays.get(taskId) || null
    case 'daily-task-repeated':
      return await db.dailyTasksRepeated.get(taskId) || null
    case 'daily-task-repeated-delayed-until':
      return await db.dailyTasksRepeatedDelayedUntil.get(taskId) || null
    case 'daily-task-repeated-delayed-by-days':
      return await db.dailyTasksRepeatedDelayedByDays.get(taskId) || null
    default:
      return null
  }
}
