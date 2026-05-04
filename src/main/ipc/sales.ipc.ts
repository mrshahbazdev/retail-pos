import { ipcMain } from 'electron'
import { eq, desc, sql } from 'drizzle-orm'
import { getDatabase } from '../database/connection'
import {
  sales,
  saleItems,
  payments,
  products,
  productVariants,
  customers,
  creditLedger
} from '../database/schema'
import { generateInvoiceNumber } from '../utils/invoice-number'

export function registerSalesHandlers(): void {
  ipcMain.handle(
    'sales:create',
    async (
      _event,
      saleData: {
        businessId: number
        userId: number
        customerId?: number
        registerId?: number
        items: Array<{
          productId: number
          variantId?: number
          productName: string
          productSku?: string
          variantName?: string
          quantity: number
          unitPrice: number
          costPrice: number
          discountType?: string
          discountValue?: number
          discountAmount?: number
          taxRate?: number
          taxAmount?: number
          subtotal: number
          total: number
        }>
        subtotal: number
        discountType?: string
        discountValue?: number
        discountAmount?: number
        taxAmount?: number
        total: number
        paidAmount: number
        changeAmount?: number
        dueAmount?: number
        paymentStatus: string
        paymentMethod: string
        referenceNumber?: string
        notes?: string
        orderType?: string
      }
    ) => {
      const db = getDatabase()
      const now = new Date().toISOString()

      const lastSale = db
        .select({ count: sql<number>`count(*)` })
        .from(sales)
        .where(eq(sales.businessId, saleData.businessId))
        .get()

      const invoiceNumber = generateInvoiceNumber('INV', lastSale?.count || 0)

      const profit = saleData.items.reduce(
        (acc, item) =>
          acc + (item.unitPrice - item.costPrice) * item.quantity - (item.discountAmount || 0),
        0
      )

      const sale = db
        .insert(sales)
        .values({
          businessId: saleData.businessId,
          invoiceNumber,
          customerId: saleData.customerId || null,
          userId: saleData.userId,
          registerId: saleData.registerId || null,
          subtotal: saleData.subtotal,
          discountType: saleData.discountType || null,
          discountValue: saleData.discountValue || 0,
          discountAmount: saleData.discountAmount || 0,
          taxAmount: saleData.taxAmount || 0,
          total: saleData.total,
          profit,
          paidAmount: saleData.paidAmount,
          changeAmount: saleData.changeAmount || 0,
          dueAmount: saleData.dueAmount || 0,
          paymentStatus: saleData.paymentStatus,
          status: 'completed',
          saleType: 'sale',
          source: 'pos',
          orderType: saleData.orderType || null,
          notes: saleData.notes || null,
          saleDate: now,
          createdAt: now,
          updatedAt: now
        })
        .returning()
        .get()

      for (const item of saleData.items) {
        const itemProfit =
          (item.unitPrice - item.costPrice) * item.quantity - (item.discountAmount || 0)

        db.insert(saleItems)
          .values({
            saleId: sale.id,
            productId: item.productId,
            variantId: item.variantId || null,
            productName: item.productName,
            productSku: item.productSku || null,
            variantName: item.variantName || null,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            costPrice: item.costPrice,
            discountType: item.discountType || null,
            discountValue: item.discountValue || 0,
            discountAmount: item.discountAmount || 0,
            taxRate: item.taxRate || 0,
            taxAmount: item.taxAmount || 0,
            subtotal: item.subtotal,
            total: item.total,
            profit: itemProfit,
            createdAt: now
          })
          .run()

        // Update stock
        if (item.variantId) {
          const variant = db
            .select()
            .from(productVariants)
            .where(eq(productVariants.id, item.variantId))
            .get()
          if (variant) {
            db.update(productVariants)
              .set({ stockQuantity: variant.stockQuantity - item.quantity })
              .where(eq(productVariants.id, item.variantId))
              .run()
          }
        } else {
          const product = db.select().from(products).where(eq(products.id, item.productId)).get()
          if (product && product.trackInventory) {
            db.update(products)
              .set({ stockQuantity: product.stockQuantity - item.quantity })
              .where(eq(products.id, item.productId))
              .run()
          }
        }
      }

      // Create payment record
      db.insert(payments)
        .values({
          businessId: saleData.businessId,
          saleId: sale.id,
          customerId: saleData.customerId || null,
          amount: saleData.paidAmount,
          paymentMethod: saleData.paymentMethod,
          referenceNumber: saleData.referenceNumber || null,
          type: 'sale',
          status: 'completed',
          createdAt: now
        })
        .run()

      // Credit ledger if credit sale
      if (saleData.paymentStatus === 'credit' && saleData.customerId) {
        const customer = db
          .select()
          .from(customers)
          .where(eq(customers.id, saleData.customerId))
          .get()
        const newBalance = (customer?.totalCredit || 0) + (saleData.dueAmount || 0)

        db.insert(creditLedger)
          .values({
            businessId: saleData.businessId,
            customerId: saleData.customerId,
            saleId: sale.id,
            type: 'debit',
            amount: saleData.dueAmount || 0,
            runningBalance: newBalance,
            description: `Sale ${invoiceNumber}`,
            createdAt: now
          })
          .run()

        db.update(customers)
          .set({ totalCredit: newBalance })
          .where(eq(customers.id, saleData.customerId))
          .run()
      }

      // Update customer totals
      if (saleData.customerId) {
        const customer = db
          .select()
          .from(customers)
          .where(eq(customers.id, saleData.customerId))
          .get()
        if (customer) {
          db.update(customers)
            .set({
              totalSpent: (customer.totalSpent || 0) + saleData.total,
              totalOrders: (customer.totalOrders || 0) + 1
            })
            .where(eq(customers.id, saleData.customerId))
            .run()
        }
      }

      return { success: true, sale }
    }
  )

  ipcMain.handle(
    'sales:list',
    async (
      _event,
      filters: {
        businessId: number
        startDate?: string
        endDate?: string
        status?: string
        customerId?: number
        page?: number
        limit?: number
      }
    ) => {
      const db = getDatabase()
      const page = filters.page || 1
      const limit = filters.limit || 50
      const offset = (page - 1) * limit

      const conditions = eq(sales.businessId, filters.businessId)

      const data = db
        .select()
        .from(sales)
        .where(conditions)
        .orderBy(desc(sales.createdAt))
        .limit(limit)
        .offset(offset)
        .all()

      const countResult = db
        .select({ count: sql<number>`count(*)` })
        .from(sales)
        .where(conditions)
        .get()

      return { data, total: countResult?.count || 0 }
    }
  )

  ipcMain.handle('sales:get', async (_event, id: number) => {
    const db = getDatabase()
    const sale = db.select().from(sales).where(eq(sales.id, id)).get()
    if (!sale) return null

    const items = db.select().from(saleItems).where(eq(saleItems.saleId, id)).all()
    const salePayments = db.select().from(payments).where(eq(payments.saleId, id)).all()

    let customer = null
    if (sale.customerId) {
      customer = db.select().from(customers).where(eq(customers.id, sale.customerId)).get()
    }

    return { ...sale, items, payments: salePayments, customer }
  })
}
