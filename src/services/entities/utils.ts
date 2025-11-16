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
