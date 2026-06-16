import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Orders } from './pages/Orders';
import { Simulator } from './pages/Simulator';
import { Coupons } from './pages/Coupons';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          {/* Global Sticky Navigation Header */}
          <Header />

          {/* Main Content Pane */}
          <main className="flex-1 pb-16 bg-slate-50/40 dark:bg-zinc-950/20">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/products" element={<Products />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/coupons" element={<Coupons />} />
              <Route path="/simulator" element={<Simulator />} />
            </Routes>
          </main>

          {/* Persistent Footer */}
          <footer className="border-t border-border py-6 bg-background text-center text-xs text-muted-foreground">
            <div className="container mx-auto px-4">
              VeloStore Order & Inventory Management System &copy; {new Date().getFullYear()} — Built for High Performance & Precision.
            </div>
          </footer>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
