// ============================================================================
// Utility Functions
// ============================================================================

export const startOfDay = (date: Date) => {
  const normalized = new Date(date)
  normalized.setHours(0, 0, 0, 0)
  return normalized
}

export const differenceInDays = (later: Date, earlier: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.floor((later.getTime() - earlier.getTime()) / msPerDay)
}

export const parseYYMMDD = (dateStr: string): Date | null => {
  // Parse yy-mm-dd format
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null

  const year = parseInt(parts[0], 10) + 2000 // yy to yyyy
  const month = parseInt(parts[1], 10) - 1  // 0-indexed
  const day = parseInt(parts[2], 10)

  const date = new Date(year, month, day)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Get the "habit day" for a given timestamp, with 4am cutoff.
 * Days start at 4am and end at 3:59:59am the next day.
 */
export const getHabitDay = (date: Date): Date => {
  const adjusted = new Date(date)

  // If it's before 4am, consider it the previous day
  if (adjusted.getHours() < 4) {
    adjusted.setDate(adjusted.getDate() - 1)
  }

  // Normalize to start of day (midnight)
  return startOfDay(adjusted)
}

/**
 * Format a date as yyyy-mm-dd for storage keys
 */
export const formatDateKey = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
