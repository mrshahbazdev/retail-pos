# RetailPOS

World-class offline multi-business POS system built with Electron, Vue.js 3, SQLite, and Tailwind CSS.

## Features

- **Multi-Business Support** — 18+ business types (Retail, Grocery, Pharmacy, Restaurant, Salon, Electronics, etc.)
- **Offline-First** — 100% local SQLite database, zero internet dependency
- **POS Terminal** — Fast billing with barcode scanning (USB, Camera, Bluetooth)
- **Inventory Management** — Products, categories, variants, stock tracking
- **Customer Management** — Credit/Udhaar system, loyalty points, customer profiles
- **Sales & Returns** — Invoices, payment tracking, return/exchange management
- **Reports & Analytics** — 44+ report types with PDF/Excel export
- **Role-Based Access** — Owner, Admin, Manager, Cashier with granular permissions
- **Multi-Currency** — PKR default, configurable for any currency
- **Bilingual** — English + Urdu (RTL support)

## Tech Stack

- **Desktop:** Electron.js
- **Frontend:** Vue.js 3 + TypeScript
- **Styling:** Tailwind CSS v4 (flat design, no gradients)
- **Database:** SQLite via better-sqlite3
- **ORM:** Drizzle ORM
- **State:** Pinia
- **Icons:** Lucide Vue
- **Build:** electron-vite + electron-builder (NSIS installer)

## Getting Started

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build for Windows
npm run build:win

# Build for Linux
npm run build:linux
```

## Project Structure

```
src/
  main/            # Electron main process
    database/      # SQLite connection & schema (Drizzle ORM)
    ipc/           # IPC handlers (auth, products, sales, etc.)
    utils/         # Password hashing, invoice numbers
  preload/         # Context bridge for renderer
  renderer/        # Vue.js frontend
    src/
      assets/      # CSS, fonts
      components/  # UI components (Button, Input, Card, etc.)
        layout/    # Sidebar, TopBar, AppLayout
        ui/        # Base UI components
        pos/       # POS-specific components
      composables/ # Vue composables
      router/      # Vue Router config
      stores/      # Pinia stores (auth, pos)
      types/       # TypeScript types
      views/       # Page components
```

## License

Private — All rights reserved.
