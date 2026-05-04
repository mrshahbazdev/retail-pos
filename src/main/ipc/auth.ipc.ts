import { ipcMain } from 'electron'
import { eq, and } from 'drizzle-orm'
import { getDatabase } from '../database/connection'
import { users, businesses } from '../database/schema'
import { hashPassword, verifyPassword } from '../utils/password'

export function registerAuthHandlers(): void {
  ipcMain.handle('auth:login', async (_event, username: string, password: string) => {
    const db = getDatabase()
    const user = db.select().from(users).where(eq(users.username, username)).get()
    if (!user) return { success: false, error: 'User not found' }
    if (!user.isActive) return { success: false, error: 'Account is disabled' }
    if (!verifyPassword(password, user.passwordHash)) {
      return { success: false, error: 'Invalid password' }
    }

    db.update(users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(users.id, user.id))
      .run()

    const business = db.select().from(businesses).where(eq(businesses.id, user.businessId)).get()

    return {
      success: true,
      user: { ...user, passwordHash: undefined },
      business
    }
  })

  ipcMain.handle('auth:login-pin', async (_event, pin: string) => {
    const db = getDatabase()
    const user = db
      .select()
      .from(users)
      .where(and(eq(users.pinCode, pin), eq(users.isActive, 1)))
      .get()

    if (!user) return { success: false, error: 'Invalid PIN' }

    db.update(users)
      .set({ lastLoginAt: new Date().toISOString() })
      .where(eq(users.id, user.id))
      .run()

    const business = db.select().from(businesses).where(eq(businesses.id, user.businessId)).get()

    return {
      success: true,
      user: { ...user, passwordHash: undefined },
      business
    }
  })

  ipcMain.handle(
    'auth:setup',
    async (
      _event,
      businessData: {
        name: string
        businessType: string
        ownerName: string
        phone: string
        address: string
        city: string
        country: string
        currencyCode: string
        currencySymbol: string
        taxName: string
        defaultTaxRate: number
        language: string
      },
      adminData: {
        name: string
        username: string
        password: string
        pin: string
      }
    ) => {
      const db = getDatabase()
      const now = new Date().toISOString()

      const business = db
        .insert(businesses)
        .values({
          ...businessData,
          createdAt: now,
          updatedAt: now
        })
        .returning()
        .get()

      const admin = db
        .insert(users)
        .values({
          businessId: business.id,
          name: adminData.name,
          username: adminData.username,
          passwordHash: hashPassword(adminData.password),
          role: 'owner',
          pinCode: adminData.pin || null,
          permissions: JSON.stringify({ all: true }),
          isActive: 1,
          createdAt: now,
          updatedAt: now
        })
        .returning()
        .get()

      return {
        success: true,
        business,
        user: { ...admin, passwordHash: undefined }
      }
    }
  )

  ipcMain.handle('auth:check-setup', async () => {
    const db = getDatabase()
    const business = db.select().from(businesses).limit(1).get()
    return { isSetup: !!business }
  })
}
