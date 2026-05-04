import { ipcMain } from 'electron'
import { eq, and, desc, sql, gte, lte } from 'drizzle-orm'
import { getDatabase } from '../database/connection'
import { sales, saleItems, products, customers, expenses, payments } from '../database/schema'

export function registerReportHandlers(): void {
  ipcMain.handle(
    'reports:dashboard',
    async (_event, businessId: number, startDate: string, endDate: string) => {
      const db = getDatabase()

      const salesData = db
        .select({
          totalSales: sql<number>`COALESCE(SUM(total), 0)`,
          totalOrders: sql<number>`COUNT(*)`,
          totalProfit: sql<number>`COALESCE(SUM(profit), 0)`,
          avgOrderValue: sql<number>`COALESCE(AVG(total), 0)`
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.status, 'completed'),
            gte(sales.saleDate, startDate),
            lte(sales.saleDate, endDate)
          )
        )
        .get()

      const expensesData = db
        .select({
          totalExpenses: sql<number>`COALESCE(SUM(amount), 0)`
        })
        .from(expenses)
        .where(
          and(
            eq(expenses.businessId, businessId),
            gte(expenses.expenseDate, startDate),
            lte(expenses.expenseDate, endDate)
          )
        )
        .get()

      const topProducts = db
        .select({
          productName: saleItems.productName,
          totalQuantity: sql<number>`SUM(${saleItems.quantity})`,
          totalRevenue: sql<number>`SUM(${saleItems.total})`
        })
        .from(saleItems)
        .innerJoin(sales, eq(saleItems.saleId, sales.id))
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.status, 'completed'),
            gte(sales.saleDate, startDate),
            lte(sales.saleDate, endDate)
          )
        )
        .groupBy(saleItems.productId)
        .orderBy(desc(sql`SUM(${saleItems.total})`))
        .limit(10)
        .all()

      const recentSales = db
        .select()
        .from(sales)
        .where(and(eq(sales.businessId, businessId), eq(sales.status, 'completed')))
        .orderBy(desc(sales.createdAt))
        .limit(10)
        .all()

      const lowStockProducts = db
        .select()
        .from(products)
        .where(
          and(
            eq(products.businessId, businessId),
            eq(products.isActive, 1),
            eq(products.trackInventory, 1),
            sql`${products.stockQuantity} <= ${products.minStockLevel}`
          )
        )
        .limit(10)
        .all()

      const paymentBreakdown = db
        .select({
          method: payments.paymentMethod,
          total: sql<number>`SUM(${payments.amount})`,
          count: sql<number>`COUNT(*)`
        })
        .from(payments)
        .innerJoin(sales, eq(payments.saleId, sales.id))
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(payments.type, 'sale'),
            gte(sales.saleDate, startDate),
            lte(sales.saleDate, endDate)
          )
        )
        .groupBy(payments.paymentMethod)
        .all()

      const creditOutstanding = db
        .select({
          total: sql<number>`COALESCE(SUM(total_credit), 0)`
        })
        .from(customers)
        .where(and(eq(customers.businessId, businessId), sql`total_credit > 0`))
        .get()

      return {
        sales: salesData,
        expenses: expensesData,
        topProducts,
        recentSales,
        lowStockProducts,
        paymentBreakdown,
        creditOutstanding: creditOutstanding?.total || 0
      }
    }
  )

  ipcMain.handle(
    'reports:sales-summary',
    async (_event, businessId: number, startDate: string, endDate: string, groupBy: string) => {
      const db = getDatabase()

      let dateExpr: ReturnType<typeof sql>
      switch (groupBy) {
        case 'day':
          dateExpr = sql`date(${sales.saleDate})`
          break
        case 'week':
          dateExpr = sql`strftime('%Y-W%W', ${sales.saleDate})`
          break
        case 'month':
          dateExpr = sql`strftime('%Y-%m', ${sales.saleDate})`
          break
        default:
          dateExpr = sql`date(${sales.saleDate})`
      }

      return db
        .select({
          period: dateExpr.as('period'),
          totalSales: sql<number>`SUM(${sales.total})`,
          totalOrders: sql<number>`COUNT(*)`,
          totalProfit: sql<number>`SUM(${sales.profit})`,
          avgOrder: sql<number>`AVG(${sales.total})`
        })
        .from(sales)
        .where(
          and(
            eq(sales.businessId, businessId),
            eq(sales.status, 'completed'),
            gte(sales.saleDate, startDate),
            lte(sales.saleDate, endDate)
          )
        )
        .groupBy(dateExpr)
        .orderBy(dateExpr)
        .all()
    }
  )
}
