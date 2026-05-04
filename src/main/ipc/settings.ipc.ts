import { ipcMain } from 'electron'
import { eq, and } from 'drizzle-orm'
import { getDatabase } from '../database/connection'
import { settings, businesses } from '../database/schema'

export function registerSettingsHandlers(): void {
  ipcMain.handle('settings:get', async (_event, businessId: number, key: string) => {
    const db = getDatabase()
    const setting = db
      .select()
      .from(settings)
      .where(and(eq(settings.businessId, businessId), eq(settings.key, key)))
      .get()
    return setting?.value || null
  })

  ipcMain.handle(
    'settings:set',
    async (
      _event,
      businessId: number,
      category: string,
      key: string,
      value: string,
      type?: string
    ) => {
      const db = getDatabase()
      const existing = db
        .select()
        .from(settings)
        .where(and(eq(settings.businessId, businessId), eq(settings.key, key)))
        .get()

      if (existing) {
        db.update(settings)
          .set({ value, type: type || 'string' })
          .where(eq(settings.id, existing.id))
          .run()
      } else {
        db.insert(settings)
          .values({ businessId, category, key, value, type: type || 'string' })
          .run()
      }

      return { success: true }
    }
  )

  ipcMain.handle('settings:get-all', async (_event, businessId: number, category?: string) => {
    const db = getDatabase()
    if (category) {
      return db
        .select()
        .from(settings)
        .where(and(eq(settings.businessId, businessId), eq(settings.category, category)))
        .all()
    }
    return db.select().from(settings).where(eq(settings.businessId, businessId)).all()
  })

  ipcMain.handle(
    'settings:update-business',
    async (_event, id: number, data: Partial<typeof businesses.$inferInsert>) => {
      const db = getDatabase()
      return db
        .update(businesses)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(businesses.id, id))
        .returning()
        .get()
    }
  )

  ipcMain.handle('settings:get-business', async (_event, id: number) => {
    const db = getDatabase()
    return db.select().from(businesses).where(eq(businesses.id, id)).get()
  })
}
