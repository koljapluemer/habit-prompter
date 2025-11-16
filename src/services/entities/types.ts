import type { Entity } from '@/db'

// ============================================================================
// Generic Service Interface
// ============================================================================

export interface EntityService<T extends Entity> {
  getAll(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(entity: Omit<T, 'id'>): Promise<string>
  update(id: string, changes: Partial<T>): Promise<void>
  delete(id: string): Promise<void>
  recordAnswer(id: string, answer: T['answers'][0]): Promise<void>
  getDueCandidates(): Promise<T[]>
}
