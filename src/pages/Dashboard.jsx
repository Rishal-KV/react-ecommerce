import React from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import {
  IndianRupee,
  Calendar,
  TrendingUp,
  ClipboardList,
  Clock,
  CheckCircle,
} from 'lucide-react';

export const Dashboard = () => {
  const {
    products,
    revenueMetrics,
    topProducts,
    orderMetrics,
    lowStockProducts
  } = useApp();

  // Helper to format currency in Indian Rupees (INR)
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Dashboard & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time metrics, order distribution, and inventory performance.
        </p>
      </div>

      {/* 1. Revenue Metrics */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <IndianRupee className="h-5 w-5 text-primary" />
          <span>Revenue Metrics</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Today's Revenue */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Today's Revenue</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatINR(revenueMetrics.today)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Invoiced today</p>
            </CardContent>
          </Card>

          {/* Weekly Revenue */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Weekly Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatINR(revenueMetrics.weekly)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Invoiced this week</p>
            </CardContent>
          </Card>

          {/* Monthly Revenue */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Monthly Revenue</CardTitle>
              <IndianRupee className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {formatINR(revenueMetrics.monthly)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Invoiced this month</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 2. Order Metrics */}
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <span>Order Metrics</span>
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Orders */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Total Orders</CardTitle>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {orderMetrics.total}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total lifetime orders</p>
            </CardContent>
          </Card>

          {/* Pending Orders */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {orderMetrics.pending}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Orders awaiting processing</p>
            </CardContent>
          </Card>

          {/* Completed Orders */}
          <Card className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-semibold text-muted-foreground">Completed Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {orderMetrics.completed}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Successfully delivered orders</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 3. Product Metrics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Best Sellers */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle>Top 5 Best Selling Products</CardTitle>
            <CardDescription>
              Calculated dynamically across active store transactions (with tie handling).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">Rank</TableHead>
                    <TableHead>Product Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Units Sold</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((item, index) => (
                    <TableRow key={item.product.id || index}>
                      <TableCell className="text-center font-bold">
                        {item.rank === 1 ? (
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-500 text-white text-xs mx-auto">
                            1
                          </span>
                        ) : item.rank === 2 ? (
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-slate-400 text-white text-xs mx-auto">
                            2
                          </span>
                        ) : item.rank === 3 ? (
                          <span className="flex items-center justify-center h-6 w-6 rounded-full bg-amber-700/80 text-white text-xs mx-auto">
                            3
                          </span>
                        ) : (
                          item.rank
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-foreground">{item.product.name}</div>
                        <div className="text-[10px] text-muted-foreground">SKU: {item.product.sku}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {item.product.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {item.quantity} Units
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-12">
                No units sold yet.
              </div>
            )}
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/10 text-xs text-muted-foreground">
              <strong>Tie Handling logic:</strong> Products with the exact same sold units share ranks. Ranks are offset properly for subsequent entries.
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>
                  Active products with stock quantities below 10.
                </CardDescription>
              </div>
              {lowStockProducts.length > 0 && (
                <Badge variant="danger" className="animate-pulse">
                  Action Required
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-right">Current Stock</TableHead>
                    <TableHead className="text-center">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStockProducts.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium text-foreground">{prod.name}</TableCell>
                      <TableCell className="font-mono text-xs">{prod.sku}</TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-red-500">
                          {prod.stock}
                        </span>
                        <span className="text-[10px] text-muted-foreground ml-1">Units</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="danger" className="text-[10px]">
                          Restock
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-16 flex flex-col items-center justify-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span>All active products have healthy stock levels (&ge;10 units).</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
