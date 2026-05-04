import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ─── BUSINESSES ───────────────────────────────────────────
export const businesses = sqliteTable('businesses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  businessType: text('business_type').notNull().default('retail'),
  ownerName: text('owner_name'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  stateProvince: text('state_province'),
  country: text('country').default('Pakistan'),
  postalCode: text('postal_code'),
  currencyCode: text('currency_code').default('PKR'),
  currencySymbol: text('currency_symbol').default('₨'),
  taxName: text('tax_name').default('Sales Tax'),
  taxNumber: text('tax_number'),
  defaultTaxRate: real('default_tax_rate').default(0),
  logoPath: text('logo_path'),
  receiptHeader: text('receipt_header'),
  receiptFooter: text('receipt_footer'),
  fiscalYearStart: text('fiscal_year_start').default('01-01'),
  dateFormat: text('date_format').default('DD/MM/YYYY'),
  timeFormat: text('time_format').default('12h'),
  language: text('language').default('en'),
  theme: text('theme').default('light'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── USERS ────────────────────────────────────────────────
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: text('role').notNull().default('cashier'),
  phone: text('phone'),
  email: text('email'),
  avatarPath: text('avatar_path'),
  pinCode: text('pin_code'),
  permissions: text('permissions'),
  hourlyRate: real('hourly_rate'),
  commissionRate: real('commission_rate'),
  isActive: integer('is_active').notNull().default(1),
  forcePasswordChange: integer('force_password_change').default(0),
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── ACTIVITY LOGS ────────────────────────────────────────
export const activityLogs = sqliteTable('activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  oldValues: text('old_values'),
  newValues: text('new_values'),
  description: text('description'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── CATEGORIES ───────────────────────────────────────────
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text('name').notNull(),
  nameLocal: text('name_local'),
  parentId: integer('parent_id'),
  icon: text('icon'),
  color: text('color'),
  imagePath: text('image_path'),
  sortOrder: integer('sort_order').default(0),
  isActive: integer('is_active').notNull().default(1),
  showOnPos: integer('show_on_pos').default(1),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── PRODUCTS ─────────────────────────────────────────────
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  categoryId: integer('category_id').references(() => categories.id),
  name: text('name').notNull(),
  nameLocal: text('name_local'),
  description: text('description'),
  sku: text('sku'),
  barcode: text('barcode'),
  barcodeType: text('barcode_type').default('EAN13'),
  costPrice: real('cost_price').notNull().default(0),
  salePrice: real('sale_price').notNull().default(0),
  wholesalePrice: real('wholesale_price'),
  minimumPrice: real('minimum_price'),
  mrp: real('mrp'),
  taxRate: real('tax_rate'),
  taxInclusive: integer('tax_inclusive').default(0),
  trackInventory: integer('track_inventory').default(1),
  stockQuantity: real('stock_quantity').notNull().default(0),
  minStockLevel: real('min_stock_level').default(5),
  maxStockLevel: real('max_stock_level'),
  reorderQuantity: real('reorder_quantity'),
  stockUnit: text('stock_unit').default('piece'),
  productType: text('product_type').default('standard'),
  isService: integer('is_service').default(0),
  allowNegativeStock: integer('allow_negative_stock').default(0),
  hasVariants: integer('has_variants').default(0),
  customFields: text('custom_fields'),
  imagePath: text('image_path'),
  thumbnailPath: text('thumbnail_path'),
  tags: text('tags'),
  brand: text('brand'),
  manufacturer: text('manufacturer'),
  isFeatured: integer('is_featured').default(0),
  isActive: integer('is_active').notNull().default(1),
  weight: real('weight'),
  weightUnit: text('weight_unit'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── PRODUCT VARIANTS ─────────────────────────────────────
export const productVariants = sqliteTable('product_variants', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variantName: text('variant_name').notNull(),
  sku: text('sku'),
  barcode: text('barcode'),
  costPrice: real('cost_price'),
  salePrice: real('sale_price'),
  wholesalePrice: real('wholesale_price'),
  stockQuantity: real('stock_quantity').notNull().default(0),
  minStockLevel: real('min_stock_level'),
  imagePath: text('image_path'),
  attributes: text('attributes').notNull(),
  isActive: integer('is_active').notNull().default(1),
  sortOrder: integer('sort_order').default(0),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── CUSTOMERS ────────────────────────────────────────────
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text('name').notNull(),
  phone: text('phone'),
  phoneSecondary: text('phone_secondary'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  cnic: text('cnic'),
  companyName: text('company_name'),
  taxNumber: text('tax_number'),
  customerType: text('customer_type').default('regular'),
  priceTier: text('price_tier').default('retail'),
  creditLimit: real('credit_limit').default(0),
  totalCredit: real('total_credit').default(0),
  allowCredit: integer('allow_credit').default(0),
  loyaltyPoints: integer('loyalty_points').default(0),
  loyaltyTier: text('loyalty_tier').default('bronze'),
  totalSpent: real('total_spent').default(0),
  totalOrders: integer('total_orders').default(0),
  storeCredit: real('store_credit').default(0),
  customFields: text('custom_fields'),
  dateOfBirth: text('date_of_birth'),
  gender: text('gender'),
  notes: text('notes'),
  tags: text('tags'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── SALES ────────────────────────────────────────────────
export const sales = sqliteTable('sales', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  invoiceNumber: text('invoice_number').notNull().unique(),
  customerId: integer('customer_id').references(() => customers.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  registerId: integer('register_id'),
  subtotal: real('subtotal').notNull().default(0),
  discountType: text('discount_type'),
  discountValue: real('discount_value').default(0),
  discountAmount: real('discount_amount').default(0),
  taxAmount: real('tax_amount').default(0),
  shippingAmount: real('shipping_amount').default(0),
  rounding: real('rounding').default(0),
  total: real('total').notNull().default(0),
  profit: real('profit').default(0),
  paidAmount: real('paid_amount').default(0),
  changeAmount: real('change_amount').default(0),
  dueAmount: real('due_amount').default(0),
  paymentStatus: text('payment_status').default('paid'),
  status: text('status').default('completed'),
  saleType: text('sale_type').default('sale'),
  source: text('source').default('pos'),
  tableId: integer('table_id'),
  orderType: text('order_type'),
  notes: text('notes'),
  internalNotes: text('internal_notes'),
  saleDate: text('sale_date')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  dueDate: text('due_date'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── SALE ITEMS ───────────────────────────────────────────
export const saleItems = sqliteTable('sale_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  productName: text('product_name').notNull(),
  productSku: text('product_sku'),
  variantName: text('variant_name'),
  quantity: real('quantity').notNull(),
  unitPrice: real('unit_price').notNull(),
  costPrice: real('cost_price').notNull().default(0),
  discountType: text('discount_type'),
  discountValue: real('discount_value').default(0),
  discountAmount: real('discount_amount').default(0),
  taxRate: real('tax_rate').default(0),
  taxAmount: real('tax_amount').default(0),
  subtotal: real('subtotal').notNull(),
  total: real('total').notNull(),
  profit: real('profit').default(0),
  modifiers: text('modifiers'),
  notes: text('notes'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── PAYMENTS ─────────────────────────────────────────────
export const payments = sqliteTable('payments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  saleId: integer('sale_id').references(() => sales.id),
  customerId: integer('customer_id').references(() => customers.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').notNull(),
  referenceNumber: text('reference_number'),
  cardLastFour: text('card_last_four'),
  bankName: text('bank_name'),
  notes: text('notes'),
  type: text('type').default('sale'),
  status: text('status').default('completed'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── CREDIT LEDGER ────────────────────────────────────────
export const creditLedger = sqliteTable('credit_ledger', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.id),
  saleId: integer('sale_id').references(() => sales.id),
  paymentId: integer('payment_id').references(() => payments.id),
  type: text('type').notNull(),
  amount: real('amount').notNull(),
  runningBalance: real('running_balance').notNull(),
  description: text('description'),
  dueDate: text('due_date'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── SUPPLIERS ────────────────────────────────────────────
export const suppliers = sqliteTable('suppliers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text('name').notNull(),
  company: text('company'),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  country: text('country').default('Pakistan'),
  taxNumber: text('tax_number'),
  bankName: text('bank_name'),
  bankAccount: text('bank_account'),
  paymentTerms: text('payment_terms'),
  balance: real('balance').default(0),
  notes: text('notes'),
  isActive: integer('is_active').notNull().default(1),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── PURCHASE ORDERS ──────────────────────────────────────
export const purchaseOrders = sqliteTable('purchase_orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  poNumber: text('po_number').notNull().unique(),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  subtotal: real('subtotal').notNull().default(0),
  taxAmount: real('tax_amount').default(0),
  shippingAmount: real('shipping_amount').default(0),
  discountAmount: real('discount_amount').default(0),
  total: real('total').notNull().default(0),
  paidAmount: real('paid_amount').default(0),
  status: text('status').default('received'),
  paymentStatus: text('payment_status').default('paid'),
  referenceNumber: text('reference_number'),
  notes: text('notes'),
  receivedDate: text('received_date'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
  updatedAt: text('updated_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── PURCHASE ORDER ITEMS ─────────────────────────────────
export const purchaseOrderItems = sqliteTable('purchase_order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  purchaseOrderId: integer('purchase_order_id')
    .notNull()
    .references(() => purchaseOrders.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  quantityOrdered: real('quantity_ordered').notNull(),
  quantityReceived: real('quantity_received').default(0),
  unitCost: real('unit_cost').notNull(),
  taxAmount: real('tax_amount').default(0),
  total: real('total').notNull()
})

// ─── STOCK ADJUSTMENTS ────────────────────────────────────
export const stockAdjustments = sqliteTable('stock_adjustments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  adjustmentNumber: text('adjustment_number').notNull().unique(),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  type: text('type').notNull(),
  quantity: real('quantity').notNull(),
  previousStock: real('previous_stock').notNull(),
  newStock: real('new_stock').notNull(),
  costPerUnit: real('cost_per_unit'),
  reason: text('reason'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── EXPENSES ─────────────────────────────────────────────
export const expenseCategories = sqliteTable('expense_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text('name').notNull(),
  parentId: integer('parent_id'),
  budgetMonthly: real('budget_monthly'),
  color: text('color'),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

export const expenses = sqliteTable('expenses', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  expenseNumber: text('expense_number'),
  categoryId: integer('category_id').references(() => expenseCategories.id),
  amount: real('amount').notNull(),
  paymentMethod: text('payment_method').default('cash'),
  referenceNumber: text('reference_number'),
  description: text('description'),
  notes: text('notes'),
  userId: integer('user_id').references(() => users.id),
  supplierId: integer('supplier_id').references(() => suppliers.id),
  isRecurring: integer('is_recurring').default(0),
  recurringPeriod: text('recurring_period'),
  status: text('status').default('approved'),
  expenseDate: text('expense_date').notNull(),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── CASH REGISTERS ───────────────────────────────────────
export const cashRegisters = sqliteTable('cash_registers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  name: text('name').notNull().default('Main Register'),
  userId: integer('user_id').references(() => users.id),
  status: text('status').default('closed'),
  openingAmount: real('opening_amount').default(0),
  closingAmount: real('closing_amount'),
  expectedAmount: real('expected_amount'),
  difference: real('difference'),
  cashSales: real('cash_sales').default(0),
  cardSales: real('card_sales').default(0),
  otherSales: real('other_sales').default(0),
  refunds: real('refunds').default(0),
  expensesPaid: real('expenses_paid').default(0),
  notes: text('notes'),
  openedAt: text('opened_at'),
  closedAt: text('closed_at'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

// ─── RETURNS ──────────────────────────────────────────────
export const returns = sqliteTable('returns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  returnNumber: text('return_number').notNull().unique(),
  saleId: integer('sale_id')
    .notNull()
    .references(() => sales.id),
  customerId: integer('customer_id').references(() => customers.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  returnType: text('return_type').default('refund'),
  totalAmount: real('total_amount').notNull(),
  refundMethod: text('refund_method'),
  reason: text('reason'),
  notes: text('notes'),
  status: text('status').default('completed'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})

export const returnItems = sqliteTable('return_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  returnId: integer('return_id')
    .notNull()
    .references(() => returns.id),
  saleItemId: integer('sale_item_id')
    .notNull()
    .references(() => saleItems.id),
  productId: integer('product_id')
    .notNull()
    .references(() => products.id),
  variantId: integer('variant_id').references(() => productVariants.id),
  quantity: real('quantity').notNull(),
  refundAmount: real('refund_amount').notNull(),
  restock: integer('restock').default(1),
  condition: text('condition').default('good'),
  reason: text('reason')
})

// ─── SETTINGS ─────────────────────────────────────────────
export const settings = sqliteTable('settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  category: text('category').notNull(),
  key: text('key').notNull(),
  value: text('value'),
  type: text('type').default('string')
})

// ─── NOTIFICATIONS ────────────────────────────────────────
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  businessId: integer('business_id')
    .notNull()
    .references(() => businesses.id),
  userId: integer('user_id').references(() => users.id),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').default('info'),
  entityType: text('entity_type'),
  entityId: integer('entity_id'),
  isRead: integer('is_read').default(0),
  actionUrl: text('action_url'),
  createdAt: text('created_at')
    .notNull()
    .$defaultFn(() => new Date().toISOString())
})
