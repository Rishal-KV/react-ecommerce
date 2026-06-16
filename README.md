# VeloStore Order & Inventory Management System

VeloStore is a high-performance React application designed for real-time order and inventory management. The system supports dynamic coupon application, warehouse stock locking, transaction rollback on cancellation, and accounting summaries.

---

## 🛠️ Setup Instructions

Follow these steps to run the application locally:

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js** (v18.x or newer recommended)
- **npm** (v9.x or newer) or **yarn**

### 2. Install Dependencies
Navigate to the project root directory and run:
```bash
npm install
```

### 3. Run the Development Server
Start the local development server by running:
```bash
npm run dev
```
The application will be accessible at the URL shown in your terminal (typically `http://localhost:5173`).

### 4. Build for Production
To generate a optimized production bundle, execute:
```bash
npm run build
```
The output files will be compiled into the `dist/` directory.

### 5. Preview Production Build
Preview the production build locally:
```bash
npm run preview
```

---

## 📐 Architecture Explanation

The application follows a modular, decoupled architecture aligning with modern React design patterns:

```
src/
├── assets/       # Static media assets (icons, logo images, hero banners)
├── components/   # Reusable UI widgets and layout modules (e.g. Header, Card, Badge, Dialog)
├── context/      # Context providers managing core state engines (Product, Order, Simulation)
├── hooks/        # Decoupled custom React hooks accessing context providers (useApp, useProducts, etc.)
├── pages/        # Router page components (Dashboard, Products, Orders, Coupons, Simulator)
├── routes/       # Centralized routing configuration mapping paths to page views
├── services/     # Abstracted data services (storageService for reading/writing localStorage)
└── utils/        # Mathematical helper utilities (analytics calculations, metrics aggregation)
```

### Core Components of the Architecture:
1. **Services Layer (`src/services/`):** Handles side effects like localStorage reading and writing, keeping context providers pure and testable.
2. **Context Layer (`src/context/`):** Houses the global reactive state. The providers define state variables, mutator functions, and validation rules.
3. **Hooks Layer (`src/hooks/`):** Exposes simple consumer hooks. Instead of importing React's `useContext` and context primitives directly in UI components, pages call these hooks, ensuring decoupling.
4. **Routes Layer (`src/routes/`):** Isolates page declarations and layout paths, making path management and nested routing easy to manage.

---

## 📋 Assumptions

During development, the following assumptions were made:
1. **LocalStorage Persistence:** The application assumes browser localStorage is persistent enough for client-side evaluation. When local storage is empty, mock data sets (`INITIAL_PRODUCTS`, `INITIAL_ORDERS`, `INITIAL_COUPONS`) are automatically seeded.
2. **Currency Standard:** All amounts and rates are computed and formatted in Indian Rupees (INR - ₹).
3. **VAT/GST Rate:** A flat 18% GST rate is assumed for tax calculations during checkout, based on the discounted subtotal.
4. **Shipping Policy:** Shipping is free for orders with a discounted subtotal of ₹5,000 or more; otherwise, a flat ₹100 shipping fee is applied.

---

## ⚠️ Known Limitations

1. **Client-Side Simulation:** There is no persistent backend database. State updates (e.g., product updates, placed orders) persist inside the active browser instance only (via LocalStorage).
2. **Tab Concurrency:** Because React state runs in memory, concurrent transactions are simulated within the "Simulator" tab sandbox rather than across real browser windows or network sockets.
3. **Scale Constraints:** Large datasets (greater than 10,000 orders) may see rendering lag during Recharts calculations since all metrics are calculated client-side in real time.
