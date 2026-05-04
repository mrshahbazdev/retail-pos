import { ipcMain } from 'electron'
import { eq, like, or, and, desc, sql } from 'drizzle-orm'
import { getDatabase } from '../database/connection'
import { customers, creditLedger } from '../database/schema'

export function registerCustomerHandlers(): void {
  ipcMain.handle(
    'customers:list',
    async (
      _event,
      filters: {
        businessId: number
        search?: string
        page?: number
        limit?: number
      }
    ) => {
      const db = getDatabase()
      const page = filters.page || 1
      const limit = filters.limit || 50
      const offset = (page - 1) * limit

      let query = db
        .select()
        .from(customers)
        .where(and(eq(customers.businessId, filters.businessId), eq(customers.isActive, 1)))
        .$dynamic()

      if (filters.search) {
        const term = `%${filters.search}%`
        query = db
          .select()
          .from(customers)
          .where(
            and(
              eq(customers.businessId, filters.businessId),
              eq(customers.isActive, 1),
              or(
                like(customers.name, term),
                like(customers.phone, term),
                like(customers.cnic, term)
              )
            )
          )
          .$dynamic()
      }

      const data = query.limit(limit).offset(offset).all()
      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(customers)
        .where(and(eq(customers.businessId, filters.businessId), eq(customers.isActive, 1)))
        .get()

      return { data, total: countResult?.count || 0 }
    }
  )

  ipcMain.handle('customers:get', async (_event, id: number) => {
    const db = getDatabase()
    const customer = db.select().from(customers).where(eq(customers.id, id)).get()
    if (!customer) return null

    const ledger = db
      .select()
      .from(creditLedger)
      .where(eq(creditLedger.customerId, id))
      .orderBy(desc(creditLedger.createdAt))
      .all()

    return { ...customer, ledger }
  })

  ipcMain.handle('customers:create', async (_event, data: typeof customers.$inferInsert) => {
    const db = getDatabase()
    const now = new Date().toISOString()
    return db
      .insert(customers)
      .values({ ...data, createdAt: now, updatedAt: now })
      .returning()
      .get()
  })

  ipcMain.handle(
    'customers:update',
    async (_event, id: number, data: Partial<typeof customers.$inferInsert>) => {
      const db = getDatabase()
      return db
        .update(customers)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(customers.id, id))
        .returning()
        .get()
    }
  )

  ipcMain.handle('customers:delete', async (_event, id: number) => {
    const db = getDatabase()
    db.update(customers).set({ isActive: 0 }).where(eq(customers.id, id)).run()
    return { success: true }
  })
}
