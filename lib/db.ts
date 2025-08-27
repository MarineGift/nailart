import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '@/shared/schema'

// Database connection with fallback for build time
let dbInstance: ReturnType<typeof drizzle> | null = null

function getDb() {
  if (!dbInstance) {
    // Skip database creation during build time
    if (typeof window === 'undefined' && !process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not available, using mock database')
      return null
    }
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required')
    }
    
    try {
      // Supabase-specific connection settings
      const client = postgres(process.env.DATABASE_URL, {
        prepare: false,
        ssl: 'require',
        idle_timeout: 20,
        max_lifetime: 60 * 30,
        max: 1
      })
      dbInstance = drizzle(client, { schema })
    } catch (error) {
      console.error('Failed to connect to database:', error)
      return null
    }
  }
  return dbInstance
}

// Export database function
export const db = getDb