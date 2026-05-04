import { ipcMain } from 'electron'
import { eq, like, or, and, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../database/connection'
import { products, categories, productVariants } from '../database/schema'

export function registerProductHandlers(): void {
  ipcMain.handle(
    'products:list',
    async (
      _event,
      filters?: {
        businessId: number
        search?: string
        categoryId?: number
        isActive?: number
        page?: number
        limit?: number
        sortBy?: string
        sortDir?: string
      }
    ) => {
      const db = getDatabase()
      if (!filters) return { data: [], total: 0 }

      let query = db
        .select()
        .from(products)
        .where(eq(products.businessId, filters.businessId))
        .$dynamic()

      if (filters.search) {
        const searchTerm = `%${filters.search}%`
        query = query.where(
          and(
            eq(products.businessId, filters.businessId),
            or(
              like(products.name, searchTerm),
              like(products.nameLocal, searchTerm),
              like(products.sku, searchTerm),
              like(products.barcode, searchTerm),
              like(products.brand, searchTerm)
            )
          )
        )
      }

      if (filters.categoryId) {
        query = query.where(
          and(
            eq(products.businessId, filters.businessId),
            eq(products.categoryId, filters.categoryId)
          )
        )
      }

      if (filters.isActive !== undefined) {
        query = query.where(
          and(eq(products.businessId, filters.businessId), eq(products.isActive, filters.isActive))
        )
      }

      const page = filters.page || 1
      const limit = filters.limit || 50
      const offset = (page - 1) * limit

      const data = query.limit(limit).offset(offset).all()

      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(products)
        .where(eq(products.businessId, filters.businessId))
        .get()

      return { data, total: countResult?.count || 0 }
    }
  )

  ipcMain.handle('products:get', async (_event, id: number) => {
    const db = getDatabase()
    return db.select().from(products).where(eq(products.id, id)).get()
  })

  ipcMain.handle('products:create', async (_event, data: typeof products.$inferInsert) => {
    const db = getDatabase()
    const now = new Date().toISOString()
    return db
      .insert(products)
      .values({ ...data, createdAt: now, updatedAt: now })
      .returning()
      .get()
  })

  ipcMain.handle(
    'products:update',
    async (_event, id: number, data: Partial<typeof products.$inferInsert>) => {
      const db = getDatabase()
      return db
        .update(products)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(products.id, id))
        .returning()
        .get()
    }
  )

  ipcMain.handle('products:delete', async (_event, id: number) => {
    const db = getDatabase()
    db.update(products).set({ isActive: 0 }).where(eq(products.id, id)).run()
    return { success: true }
  })

  ipcMain.handle('products:search-barcode', async (_event, barcode: string, businessId: number) => {
    const db = getDatabase()
    const product = db
      .select()
      .from(products)
      .where(and(eq(products.barcode, barcode), eq(products.businessId, businessId)))
      .get()
    if (product) return { type: 'product', data: product }

    const variant = db
      .select()
      .from(productVariants)
      .where(eq(productVariants.barcode, barcode))
      .get()
    if (variant) {
      const parentProduct = db
        .select()
        .from(products)
        .where(eq(products.id, variant.productId))
        .get()
      return { type: 'variant', data: variant, product: parentProduct }
    }

    return null
  })

  // Categories
  ipcMain.handle('categories:list', async (_event, businessId: number) => {
    const db = getDatabase()
    return db
      .select()
      .from(categories)
      .where(and(eq(categories.businessId, businessId), eq(categories.isActive, 1)))
      .orderBy(asc(categories.sortOrder))
      .all()
  })

  ipcMain.handle('categories:create', async (_event, data: typeof categories.$inferInsert) => {
    const db = getDatabase()
    const now = new Date().toISOString()
    return db
      .insert(categories)
      .values({ ...data, createdAt: now, updatedAt: now })
      .returning()
      .get()
  })

  ipcMain.handle(
    'categories:update',
    async (_event, id: number, data: Partial<typeof categories.$inferInsert>) => {
      const db = getDatabase()
      return db
        .update(categories)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))
        .returning()
        .get()
    }
  )

  ipcMain.handle('categories:delete', async (_event, id: number) => {
    const db = getDatabase()
    db.update(categories).set({ isActive: 0 }).where(eq(categories.id, id)).run()
    return { success: true }
  })
}
