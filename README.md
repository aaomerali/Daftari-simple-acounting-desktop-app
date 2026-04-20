# دفتري (Daftari) - Modern Desktop POS & Accounting App

Daftari is a fully offline, secure, and modern desktop accounting application designed for small to medium-sized retail stores and enterprises. Built with a pristine Arabic RTL interface, it combines the ease of a POS machine with robust inventory and financial management.

## ✨ New & Advanced Features
1. **Secure Authentication:** Built-in secure login system with SHA-256 password hashing. Supports user roles (Admin/Cashier) for robust access control.
2. **Comprehensive Invoice Archive (أرشيف الفواتير):** A sleek unified system for managing both Sales and Purchases invoices. Integrated with a blazing fast **Live Filter** (Filter by name, ID, date range, or payment status).
3. **80mm Thermal Receipt Printing:** Both Sales and Purchases invoices are elegantly formatted for standard 80mm thermal receipt printers without any external dependencies. Dynamic content automatically changes based on the invoice type.
4. **Expense Management with CRUD:** Track daily operational costs with full ability to Edit and Delete expenses safely.
5. **Dynamic Settings & Store Setup:** Configure your App Name, Store Name, and Local Currency. (Settings reflect globally across the app in real-time).

## 📊 Core Modules
* **Dashboard (لوحة التحكم):** Real-time monitoring of daily sales, expenses, and net profit.
* **Products & Inventory (المنتجات والمخزون):** Manage product lists, stock quantities, barcodes, and receive low stock warnings.
* **Sales & POS (نقطة البيع):** Quick checkout operations, multiple payment modes (Cash/Card/Deferred). Automatic stock deduction calculation.
* **Purchases (المشتريات):** Track inventory replenishment. Auto-generates purchase reference numbers and automatically recalculates average product purchase prices. 
* **Customers & Suppliers (العملاء والموردين):** Track contacts, phone numbers, and outstanding debts.
* **Reports (التقارير):** Advanced charts and statistical indicators mapping sales histories (Coming soon).

## 💻 Tech Stack
- **Frontend Framework:** React.js (Vite)
- **State Management:** Zustand
- **Icons & UI:** Tailwind CSS, Lucide React
- **Backend/Desktop wrapper:** Electron.js 
- **Database:** SQLite (via `better-sqlite3`) - Fully localized and blazingly fast.
- **Security:** Node.js native `crypto` module.

## 🚀 Setup Instructions

Ensure you have Node.js 18+ installed on your system.

### Install dependencies
```bash
npm install
```

### Database Initialization
The application automatically creates `daftari.db` in your system's `AppData` / `Roaming` directory upon first launch and seeds an Admin account:
- **Email:** `admin@daftari.com`
- **Password:** `daftari123`

### Run for Development
```bash
npm run dev
```

### Build and Package (Windows)
```bash
npm run build:win
```
The setup executable will be generated inside the `dist` folder (e.g. `daftari-setup.exe`).
