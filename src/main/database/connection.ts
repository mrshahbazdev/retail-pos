import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync } from 'fs'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

let db: ReturnType<typeof drizzle> | null = null
let sqlite: Database.Database | null = null

function getDbPath(): string {
  const userDataPath = app.getPath('userData')
  const dataDir = join(userDataPath, 'data')
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true })
  }
  return join(dataDir, 'retailpos.db')
}

export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) return db as ReturnType<typeof drizzle<typeof schema>>

  const dbPath = getDbPath()
  sqlite = new Database(dbPath)

  sqlite.pragma('journal_mode = WAL')
  sqlite.pragma('foreign_keys = ON')
  sqlite.pragma('busy_timeout = 5000')

  db = drizzle(sqlite, { schema })
  return db as ReturnType<typeof drizzle<typeof schema>>
}

export function closeDatabase(): void {
  if (sqlite) {
    sqlite.close()
    sqlite = null
    db = null
  }
}

export function initializeDatabase(): void {
  const database = getDatabase()

  const sqliteDb = sqlite!
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS businesses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      business_type TEXT NOT NULL DEFAULT 'retail',
      owner_name TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      state_province TEXT,
      country TEXT DEFAULT 'Pakistan',
      postal_code TEXT,
      currency_code TEXT DEFAULT 'PKR',
      currency_symbol TEXT DEFAULT '₨',
      tax_name TEXT DEFAULT 'Sales Tax',
      tax_number TEXT,
      default_tax_rate REAL DEFAULT 0,
      logo_path TEXT,
      receipt_header TEXT,
      receipt_footer TEXT,
      fiscal_year_start TEXT DEFAULT '01-01',
      date_format TEXT DEFAULT 'DD/MM/YYYY',
      time_format TEXT DEFAULT '12h',
      language TEXT DEFAULT 'en',
      theme TEXT DEFAULT 'light',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      name TEXT NOT NULL,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      phone TEXT,
      email TEXT,
      avatar_path TEXT,
      pin_code TEXT,
      permissions TEXT,
      hourly_rate REAL,
      commission_rate REAL,
      is_active INTEGER NOT NULL DEFAULT 1,
      force_password_change INTEGER DEFAULT 0,
      last_login_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      action TEXT NOT NULL,
      entity_type TEXT,
      entity_id INTEGER,
      old_values TEXT,
      new_values TEXT,
      description TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      name TEXT NOT NULL,
      name_local TEXT,
      parent_id INTEGER,
      icon TEXT,
      color TEXT,
      image_path TEXT,
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      show_on_pos INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      category_id INTEGER REFERENCES categories(id),
      name TEXT NOT NULL,
      name_local TEXT,
      description TEXT,
      sku TEXT,
      barcode TEXT,
      barcode_type TEXT DEFAULT 'EAN13',
      cost_price REAL NOT NULL DEFAULT 0,
      sale_price REAL NOT NULL DEFAULT 0,
      wholesale_price REAL,
      minimum_price REAL,
      mrp REAL,
      tax_rate REAL,
      tax_inclusive INTEGER DEFAULT 0,
      track_inventory INTEGER DEFAULT 1,
      stock_quantity REAL NOT NULL DEFAULT 0,
      min_stock_level REAL DEFAULT 5,
      max_stock_level REAL,
      reorder_quantity REAL,
      stock_unit TEXT DEFAULT 'piece',
      product_type TEXT DEFAULT 'standard',
      is_service INTEGER DEFAULT 0,
      allow_negative_stock INTEGER DEFAULT 0,
      has_variants INTEGER DEFAULT 0,
      custom_fields TEXT,
      image_path TEXT,
      thumbnail_path TEXT,
      tags TEXT,
      brand TEXT,
      manufacturer TEXT,
      is_featured INTEGER DEFAULT 0,
      is_active INTEGER NOT NULL DEFAULT 1,
      weight REAL,
      weight_unit TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
    CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
    CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

    CREATE TABLE IF NOT EXISTS product_variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL REFERENCES products(id),
      variant_name TEXT NOT NULL,
      sku TEXT,
      barcode TEXT,
      cost_price REAL,
      sale_price REAL,
      wholesale_price REAL,
      stock_quantity REAL NOT NULL DEFAULT 0,
      min_stock_level REAL,
      image_path TEXT,
      attributes TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      name TEXT NOT NULL,
      phone TEXT,
      phone_secondary TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      cnic TEXT,
      company_name TEXT,
      tax_number TEXT,
      customer_type TEXT DEFAULT 'regular',
      price_tier TEXT DEFAULT 'retail',
      credit_limit REAL DEFAULT 0,
      total_credit REAL DEFAULT 0,
      allow_credit INTEGER DEFAULT 0,
      loyalty_points INTEGER DEFAULT 0,
      loyalty_tier TEXT DEFAULT 'bronze',
      total_spent REAL DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      store_credit REAL DEFAULT 0,
      custom_fields TEXT,
      date_of_birth TEXT,
      gender TEXT,
      notes TEXT,
      tags TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(name);

    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      invoice_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER REFERENCES customers(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      register_id INTEGER,
      subtotal REAL NOT NULL DEFAULT 0,
      discount_type TEXT,
      discount_value REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      shipping_amount REAL DEFAULT 0,
      rounding REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      profit REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      change_amount REAL DEFAULT 0,
      due_amount REAL DEFAULT 0,
      payment_status TEXT DEFAULT 'paid',
      status TEXT DEFAULT 'completed',
      sale_type TEXT DEFAULT 'sale',
      source TEXT DEFAULT 'pos',
      table_id INTEGER,
      order_type TEXT,
      notes TEXT,
      internal_notes TEXT,
      sale_date TEXT NOT NULL,
      due_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
    CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoice_number);

    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL REFERENCES sales(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      variant_id INTEGER REFERENCES product_variants(id),
      product_name TEXT NOT NULL,
      product_sku TEXT,
      variant_name TEXT,
      quantity REAL NOT NULL,
      unit_price REAL NOT NULL,
      cost_price REAL NOT NULL DEFAULT 0,
      discount_type TEXT,
      discount_value REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      subtotal REAL NOT NULL,
      total REAL NOT NULL,
      profit REAL DEFAULT 0,
      modifiers TEXT,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      sale_id INTEGER REFERENCES sales(id),
      customer_id INTEGER REFERENCES customers(id),
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      reference_number TEXT,
      card_last_four TEXT,
      bank_name TEXT,
      notes TEXT,
      type TEXT DEFAULT 'sale',
      status TEXT DEFAULT 'completed',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS credit_ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      customer_id INTEGER NOT NULL REFERENCES customers(id),
      sale_id INTEGER REFERENCES sales(id),
      payment_id INTEGER REFERENCES payments(id),
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      running_balance REAL NOT NULL,
      description TEXT,
      due_date TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      name TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      email TEXT,
      address TEXT,
      city TEXT,
      country TEXT DEFAULT 'Pakistan',
      tax_number TEXT,
      bank_name TEXT,
      bank_account TEXT,
      payment_terms TEXT,
      balance REAL DEFAULT 0,
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      po_number TEXT NOT NULL UNIQUE,
      supplier_id INTEGER REFERENCES suppliers(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      subtotal REAL NOT NULL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      shipping_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL NOT NULL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'received',
      payment_status TEXT DEFAULT 'paid',
      reference_number TEXT,
      notes TEXT,
      received_date TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS purchase_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_order_id INTEGER NOT NULL REFERENCES purchase_orders(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      variant_id INTEGER REFERENCES product_variants(id),
      quantity_ordered REAL NOT NULL,
      quantity_received REAL DEFAULT 0,
      unit_cost REAL NOT NULL,
      tax_amount REAL DEFAULT 0,
      total REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stock_adjustments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      adjustment_number TEXT NOT NULL UNIQUE,
      product_id INTEGER NOT NULL REFERENCES products(id),
      variant_id INTEGER REFERENCES product_variants(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      quantity REAL NOT NULL,
      previous_stock REAL NOT NULL,
      new_stock REAL NOT NULL,
      cost_per_unit REAL,
      reason TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expense_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      name TEXT NOT NULL,
      parent_id INTEGER,
      budget_monthly REAL,
      color TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      expense_number TEXT,
      category_id INTEGER REFERENCES expense_categories(id),
      amount REAL NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      reference_number TEXT,
      description TEXT,
      notes TEXT,
      user_id INTEGER REFERENCES users(id),
      supplier_id INTEGER REFERENCES suppliers(id),
      is_recurring INTEGER DEFAULT 0,
      recurring_period TEXT,
      status TEXT DEFAULT 'approved',
      expense_date TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cash_registers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      name TEXT NOT NULL DEFAULT 'Main Register',
      user_id INTEGER REFERENCES users(id),
      status TEXT DEFAULT 'closed',
      opening_amount REAL DEFAULT 0,
      closing_amount REAL,
      expected_amount REAL,
      difference REAL,
      cash_sales REAL DEFAULT 0,
      card_sales REAL DEFAULT 0,
      other_sales REAL DEFAULT 0,
      refunds REAL DEFAULT 0,
      expenses_paid REAL DEFAULT 0,
      notes TEXT,
      opened_at TEXT,
      closed_at TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS returns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      return_number TEXT NOT NULL UNIQUE,
      sale_id INTEGER NOT NULL REFERENCES sales(id),
      customer_id INTEGER REFERENCES customers(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      return_type TEXT DEFAULT 'refund',
      total_amount REAL NOT NULL,
      refund_method TEXT,
      reason TEXT,
      notes TEXT,
      status TEXT DEFAULT 'completed',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS return_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      return_id INTEGER NOT NULL REFERENCES returns(id),
      sale_item_id INTEGER NOT NULL REFERENCES sale_items(id),
      product_id INTEGER NOT NULL REFERENCES products(id),
      variant_id INTEGER REFERENCES product_variants(id),
      quantity REAL NOT NULL,
      refund_amount REAL NOT NULL,
      restock INTEGER DEFAULT 1,
      condition TEXT DEFAULT 'good',
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      category TEXT NOT NULL,
      key TEXT NOT NULL,
      value TEXT,
      type TEXT DEFAULT 'string'
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id INTEGER NOT NULL REFERENCES businesses(id),
      user_id INTEGER REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      severity TEXT DEFAULT 'info',
      entity_type TEXT,
      entity_id INTEGER,
      is_read INTEGER DEFAULT 0,
      action_url TEXT,
      created_at TEXT NOT NULL
    );
  `)

  return database
}
