import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import fs from 'fs'

const isDev = !app.isPackaged

let db: ReturnType<typeof Database>

export function initDatabase() {
  const userDataPath = app.getPath('userData')
  const dbFolder = join(userDataPath, 'database')
  
  if (!fs.existsSync(dbFolder)) {
    fs.mkdirSync(dbFolder, { recursive: true })
  }

  const dbPath = join(dbFolder, 'daftari.db')
  console.log('Database path:', dbPath)
  
  db = new Database(dbPath, { verbose: isDev ? console.log : undefined })
  db.pragma('journal_mode = WAL')
  
  initSchema()
}

function initSchema() {
  // Settings
  db.prepare(`
    CREATE TABLE IF NOT EXISTS settings (
      app_name TEXT DEFAULT 'دفتري',
      currency_code TEXT DEFAULT 'SAR',
      currency_symbol TEXT DEFAULT 'ر.س',
      currency_decimal_places INTEGER DEFAULT 2,
      store_name TEXT DEFAULT '',
      store_logo TEXT DEFAULT '',
      store_address TEXT DEFAULT '',
      store_phone TEXT DEFAULT '',
      tax_rate REAL DEFAULT 0
    )
  `).run()

  // Seed settings if empty
  const count = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number }
  if (count.count === 0) {
    db.prepare(`
      INSERT INTO settings (app_name, currency_code, currency_symbol, currency_decimal_places)
      VALUES ('دفتري', 'SAR', 'ر.س', 2)
    `).run()
  }

  // Categories
  db.prepare(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `).run()

  // Products
  db.prepare(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category_id INTEGER,
      purchase_price REAL DEFAULT 0,
      selling_price REAL NOT NULL,
      quantity INTEGER DEFAULT 0,
      min_quantity INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'قطعة',
      barcode TEXT,
      FOREIGN KEY(category_id) REFERENCES categories(id)
    )
  `).run()

  // Customers
  db.prepare(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      notes TEXT
    )
  `).run()

  // Suppliers
  db.prepare(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT,
      category TEXT,
      notes TEXT
    )
  `).run()

  // Sales
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      date TEXT NOT NULL,
      total REAL NOT NULL,
      discount REAL DEFAULT 0,
      tax REAL DEFAULT 0,
      payment_method TEXT NOT NULL, /* cash, credit, deferred */
      FOREIGN KEY(customer_id) REFERENCES customers(id)
    )
  `).run()

  // Sale Items
  db.prepare(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(sale_id) REFERENCES sales(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `).run()

  // Purchases
  db.prepare(`
    CREATE TABLE IF NOT EXISTS purchases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      total REAL NOT NULL,
      paid_status TEXT NOT NULL, /* paid, unpaid */
      FOREIGN KEY(supplier_id) REFERENCES suppliers(id)
    )
  `).run()

  // Purchase Items
  db.prepare(`
    CREATE TABLE IF NOT EXISTS purchase_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      purchase_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      price REAL NOT NULL,
      FOREIGN KEY(purchase_id) REFERENCES purchases(id),
      FOREIGN KEY(product_id) REFERENCES products(id)
    )
  `).run()

  // Expenses
  db.prepare(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT
    )
  `).run()

  // Payments (Customer payments / Supplier payments)
  db.prepare(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entity_type TEXT NOT NULL, /* customer, supplier */
      entity_id INTEGER NOT NULL,
      amount REAL NOT NULL,
      date TEXT NOT NULL,
      notes TEXT
    )
  `).run()
}

export function executeQuery(query: string, params: any[] = []) {
  return db.prepare(query).all(...params)
}

export function executeRun(query: string, params: any[] = []) {
  return db.prepare(query).run(...params)
}

export function executeGet(query: string, params: any[] = []) {
  return db.prepare(query).get(...params)
}
