import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, ClipboardList, Zap, Moon, Sun, AlertTriangle, Ticket } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Badge } from './ui/Badge';

export const Header = React.memo(() => {
  const { lowStockProducts, orderMetrics } = useApp();
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/products', label: 'Products', icon: ShoppingBag },
    { to: '/orders', label: 'Orders', icon: ClipboardList },
    { to: '/coupons', label: 'Coupons', icon: Ticket },
    { to: '/simulator', label: 'Simulators', icon: Zap },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-md">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground bg-gradient-to-r from-primary to-violet-500 bg-clip-text text-transparent">
            Admin
          </span>
        </div>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
                {item.label === 'Products' && lowStockProducts.length > 0 && (
                  <Badge variant="danger" className="ml-1 px-1.5 py-0.5 text-[10px]">
                    {lowStockProducts.length}
                  </Badge>
                )}
                {item.label === 'Orders' && orderMetrics.pending > 0 && (
                  <Badge variant="warning" className="ml-1 px-1.5 py-0.5 text-[10px]">
                    {orderMetrics.pending}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Utilities & Mobile Nav Menu (represented concisely) */}
        <div className="flex items-center gap-4">
          {/* Low Stock Warning Icon if any */}
          {lowStockProducts.length > 0 && (
            <div className="relative group cursor-pointer hidden sm:block">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <span className="absolute right-0 top-12 scale-0 rounded bg-red-600 p-2 text-xs text-white group-hover:scale-100 transition-all whitespace-nowrap z-50">
                {lowStockProducts.length} products low on stock!
              </span>
            </div>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-all hover:bg-muted hover:scale-105"
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>
      </div>

      {/* Mobile nav fallback row */}
      <div className="md:hidden flex items-center justify-around border-t border-border bg-background py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded px-2 py-1 text-[11px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </header>
  );
});

Header.displayName = 'Header';
