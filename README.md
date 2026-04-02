# دفتري (Daftari) - Desktop Accounting App

Daftari is a fully offline desktop accounting application designed for small to medium-sized retail stores, featuring an Arabic RTL interface.

## Core Features
1. **Dashboard (لوحة التحكم):** Real-time monitoring of daily sales, expenses, and net profit.
2. **Products & Inventory (المنتجات والمخزون):** Manage product lists, stock quantities, barcodes, and low stock warnings.
3. **Sales & POS (المبيعات):** Quick checkout operations, multiple payment methods, and PDF invoice printing.
4. **Purchases (المشتريات):** Track inventory replenishment.
5. **Customers & Suppliers (العملاء والموردين):** Track contacts, phone numbers, and outstanding debts.
6. **Expenses (المصروفات):** Manage daily and monthly operating costs.
7. **Reports (التقارير):** PDF exports mapping sales histories.
8. **Settings (الإعدادات):** Setup active currency (Saudi Riyal / USD) mapping app-wide.

## Tech Stack
- Frontend: React.js (Vite)
- Desktop Packaging: Electron
- Local DB: SQLite (via better-sqlite3)
- Styling: Tailwind CSS & Lucide React
- PDF Generation: jsPDF
- Charting: Recharts

## Setup Instructions

Ensure you have Node.js 18+ installed on your system.

### Install dependencies
\`\`\`bash
npm install
\`\`\`

### Run for Development
\`\`\`bash
npm run dev
\`\`\`

### Build and Package (Windows)
\`\`\`bash
npm run build:win
\`\`\`
The setup executable will be generated inside the \`dist\` folder (e.g. \`daftari-setup.exe\`).
