import React, { useState, useMemo } from 'react';
import { useApp } from '../hooks/useApp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';
import { Play, RotateCcw, AlertTriangle, RefreshCw, Layers, TrendingUp, Info, Download } from 'lucide-react';

export const Simulator = () => {
  const {
    products,
    orders,
    cancelOrder,
    simStock,
    simLog,
    runSimulation
  } = useApp();

  const financeMetrics = useMemo(() => {
    const activeOrders = orders.filter((o) => o.status !== 'Cancelled');
    const grossRevenue = activeOrders.reduce((sum, o) => sum + o.subtotal, 0);
    const totalDiscounts = activeOrders.reduce((sum, o) => sum + o.discount, 0);
    const netRevenue = activeOrders.reduce((sum, o) => sum + o.grandTotal, 0);

    let totalCostOfSales = 0;
    activeOrders.forEach((o) => {
      o.products.forEach((item) => {
        const costPrice = item.price * 0.7;
        totalCostOfSales += costPrice * item.quantity;
      });
    });

    const profit = Math.max(0, (grossRevenue - totalDiscounts) - totalCostOfSales);
    const profitMargin = (grossRevenue - totalDiscounts) > 0
      ? Math.round((profit / (grossRevenue - totalDiscounts)) * 100)
      : 0;

    return {
      grossRevenue,
      totalDiscounts,
      netRevenue,
      profit,
      profitMargin
    };
  }, [orders]);

  // Challenge 1 state: custom input playground
  const [inputs, setInputs] = useState([
    { product: 'A', quantity: 10 },
    { product: 'B', quantity: 25 },
    { product: 'A', quantity: 15 }
  ]);
  const [newProdName, setNewProdName] = useState('');
  const [newProdQty, setNewProdQty] = useState('');

  // Challenge 2 state: simulator inputs
  const [qtyA, setQtyA] = useState(20);
  const [qtyB, setQtyB] = useState(40);

  // Challenge 3 state: cancellation dropdown
  const [cancellationOrderId, setCancellationOrderId] = useState('');

  // ==========================================
  // CHALLENGE 1 TIE HANDLING PLAYGROUND LOGIC
  // ==========================================
  const addPlaygroundInput = () => {
    if (!newProdName.trim() || !newProdQty) return;
    const qty = Number(newProdQty);
    if (isNaN(qty) || qty <= 0) return;

    setInputs((prev) => [...prev, { product: newProdName.trim().toUpperCase(), quantity: qty }]);
    setNewProdName('');
    setNewProdQty('');
  };

  const clearPlaygroundInputs = () => {
    setInputs([]);
  };

  const playgroundResult = useMemo(() => {
    // 1. Group and sum quantities
    const grouped = {};
    inputs.forEach((item) => {
      const name = item.product;
      grouped[name] = (grouped[name] || 0) + item.quantity;
    });

    // 2. Sort descending
    const sorted = Object.entries(grouped)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity);

    // 3. Assign ranks with tie handling
    let currentRank = 1;
    let prevQty = null;
    let rankOffset = 0;

    return sorted.map((item) => {
      if (prevQty !== null && item.quantity < prevQty) {
        currentRank = currentRank + rankOffset;
        rankOffset = 1;
      } else if (prevQty !== null && item.quantity === prevQty) {
        // Tie scenario: rank remains identical
        rankOffset += 1;
      } else {
        rankOffset = 1;
      }
      prevQty = item.quantity;

      return {
        ...item,
        rank: currentRank
      };
    });
  }, [inputs]);

  // ==========================================
  // CHALLENGE 3 ROLLBACK SELECTABLE LIST
  // ==========================================
  const cancellableOrders = useMemo(() => {
    return orders.filter((o) => o.status !== 'Cancelled' && o.status !== 'Delivered');
  }, [orders]);

  const selectedCancellableOrder = useMemo(() => {
    return orders.find((o) => o.id === cancellationOrderId);
  }, [orders, cancellationOrderId]);

  const handleSimulateCancel = () => {
    if (!cancellationOrderId) return;
    cancelOrder(cancellationOrderId);
    setCancellationOrderId('');
  };

  // Format currency helper
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const downloadReport = () => {
    const reportContent = `Revenue Report
--------------------------------------
Gross Revenue: ${formatINR(financeMetrics.grossRevenue)}
Total Discounts Given: -${formatINR(financeMetrics.totalDiscounts)}
Net Revenue: ${formatINR(financeMetrics.netRevenue)}
Profit Margin: ${financeMetrics.profitMargin}%
--------------------------------------
Generated on: ${new Date().toLocaleString('en-IN')}
`;
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `revenue_report_${new Date().toISOString().split('T')[0]}.txt`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
          Advanced Challenge Simulators
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Interactive dashboards and sandboxes to test inventory locking, cancellations, ties, and revenue metrics.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CHALLENGE 2: INVENTORY RESERVATION */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Challenge 2: Inventory Reservation</CardTitle>
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">Race Conditions</Badge>
            </div>
            <CardDescription>
              Demonstrate thread-safe concurrency checks to prevent overselling. Initial stock is locked at 50 units.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="p-4 bg-muted/30 border border-border rounded-lg flex justify-between items-center">
              <div>
                <span className="text-xs text-muted-foreground block font-medium">Initial Simulator Stock</span>
                <span className="text-3xl font-bold text-foreground">50 Units</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground block font-medium">Current Simulated Stock</span>
                <span className={`text-3xl font-bold ${simStock > 0 ? 'text-green-500' : 'text-red-500'}`}>{simStock} Units</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">User A Request (Qty)</label>
                <Input
                  type="number"
                  value={qtyA}
                  onChange={(e) => setQtyA(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">User B Request (Qty)</label>
                <Input
                  type="number"
                  value={qtyB}
                  onChange={(e) => setQtyB(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => runSimulation(qtyA, qtyB)}
                className="flex-1 flex items-center justify-center gap-1.5"
              >
                <Play className="h-4 w-4" /> Run Concurrent Simulation
              </Button>
              <Button
                variant="outline"
                onClick={() => runSimulation(20, 40)}
                title="Reset Simulation values"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>

            {/* Live Terminal Log */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground block">Simulated Transaction Log:</span>
              <div className="h-48 border border-border rounded-lg bg-zinc-950 p-3 overflow-y-auto text-xs font-mono space-y-1.5 text-zinc-300">
                {simLog.length > 0 ? (
                  simLog.map((log, index) => (
                    <div
                      key={index}
                      className={`${log.type === 'success' ? 'text-emerald-400' :
                        log.type === 'error' ? 'text-red-400 font-semibold' : 'text-zinc-400'
                        }`}
                    >
                      <span className="text-zinc-600 mr-1.5">[{log.time}]</span>
                      {log.message}
                    </div>
                  ))
                ) : (
                  <div className="text-zinc-600 text-center pt-16 italic">
                    Click 'Run Concurrent Simulation' to view locking checks.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHALLENGE 1: BEST SELLING TIE SCENARIO */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Challenge 1: Best Selling Tie Playground</CardTitle>
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">Sorting & Ties</Badge>
            </div>
            <CardDescription>
              Input custom quantities for products and see how the engine ranks them, assigning equal rankings for ties.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="border border-border rounded-lg p-3 bg-muted/10 space-y-2">
              <span className="text-xs font-semibold text-muted-foreground block">Add Entry:</span>
              <div className="grid grid-cols-5 gap-2 items-end">
                <div className="col-span-2">
                  <Input
                    placeholder="Product Name (e.g. A)"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="col-span-2">
                  <Input
                    type="number"
                    placeholder="Qty (e.g. 10)"
                    value={newProdQty}
                    onChange={(e) => setNewProdQty(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <Button onClick={addPlaygroundInput} variant="outline" size="sm" className="w-full text-xs">
                  Add
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-muted-foreground">Sales Transaction List:</span>
              {inputs.length > 0 && (
                <button onClick={clearPlaygroundInputs} className="text-red-500 hover:underline">
                  Clear All
                </button>
              )}
            </div>

            {/* List of raw transactions */}
            <div className="flex flex-wrap gap-1.5 p-2 bg-muted/20 border border-border rounded-md min-h-[48px] max-h-[80px] overflow-y-auto">
              {inputs.length > 0 ? (
                inputs.map((item, index) => (
                  <Badge key={index} variant="outline" className="text-[10px] py-0.5 px-2 bg-background flex items-center gap-1">
                    Product {item.product}: <span className="font-bold text-primary">{item.quantity}</span>
                  </Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground italic m-auto">No transactions added yet.</span>
              )}
            </div>

            {/* Compiled Rank Results */}
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground block">Engine Output (Ties Handled):</span>
              <div className="border border-border rounded-lg overflow-hidden bg-card text-xs">
                <table className="w-full text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] border-b border-border">
                    <tr>
                      <th className="p-2.5 text-center w-12">Rank</th>
                      <th className="p-2.5">Product Name</th>
                      <th className="p-2.5 text-right">Aggregated Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {playgroundResult.length > 0 ? (
                      playgroundResult.map((item, index) => (
                        <tr key={index} className={item.rank === 1 ? 'bg-amber-500/5' : ''}>
                          <td className="p-2 text-center font-bold text-primary">
                            #{item.rank}
                          </td>
                          <td className="p-2 font-semibold">{item.name}</td>
                          <td className="p-2 text-right font-bold text-foreground">{item.quantity} units</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-4 text-center text-muted-foreground italic">
                          Wait for input transaction list...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* CHALLENGE 3: CANCELLATION ROLLBACK */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Challenge 3: Order Cancellation Rollback</CardTitle>
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">Auto Rollback</Badge>
            </div>
            <CardDescription>
              Cancel an active order (Pending or Processing) and watch how the warehouse stock levels automatically restore.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Select Active Order to Cancel</label>
              <Select
                placeholder="Choose Cancellable Order..."
                options={cancellableOrders.map((o) => ({
                  value: o.id,
                  label: `${o.id} - ${o.customerName} (${o.products.map(p => `${p.name} x${p.quantity}`).join(', ')})`,
                }))}
                value={cancellationOrderId}
                onChange={(e) => setCancellationOrderId(e.target.value)}
              />
            </div>

            {selectedCancellableOrder ? (
              <div className="p-4 bg-yellow-500/5 border border-yellow-500/10 rounded-lg space-y-3 animate-fade-in text-xs">
                <div className="font-semibold text-foreground">
                  Order Details for rollback analysis:
                </div>
                <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                  <div>Status: <Badge variant="warning">{selectedCancellableOrder.status}</Badge></div>
                  <div>Grand Total: <span className="font-bold text-foreground">{formatINR(selectedCancellableOrder.grandTotal)}</span></div>
                </div>

                {/* Stock levels beforehand */}
                <div className="space-y-1.5 border-t border-border pt-2 mt-2">
                  <span className="font-semibold block text-[11px]">Items in Order & Current Warehouse Stock:</span>
                  {selectedCancellableOrder.products.map((item) => {
                    const prod = products.find((p) => p.id === item.id);
                    return (
                      <div key={item.id} className="flex justify-between items-center text-xs">
                        <span>{item.name} (Ordered: <strong className="text-primary">{item.quantity}</strong>)</span>
                        <span>Current Stock: <strong className="text-foreground">{prod ? prod.stock : 0} units</strong></span>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleSimulateCancel}
                  variant="destructive"
                  className="w-full flex items-center justify-center gap-1.5 mt-2"
                >
                  Cancel Order & Restore Stock
                </Button>
              </div>
            ) : (
              <div className="text-center text-xs text-muted-foreground border border-dashed border-border rounded-lg py-12">
                No order selected. Choose an order above to test rollback.
              </div>
            )}

            <div className="p-3 bg-indigo-500/5 rounded-lg border border-indigo-500/10 text-xs text-muted-foreground flex gap-2">
              <Info className="h-4 w-4 text-indigo-500 shrink-0" />
              <div>
                <strong>Rollback Logic:</strong> On calling `cancelOrder()`, the engine runs an atomic updater iterating over each order product, incrementing its warehouse inventory stock by the original quantity. It guarantees stock is never deleted or duplicated.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CHALLENGE 4: REVENUE REPORT */}
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Revenue Report</CardTitle>
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/20">Accounting</Badge>
            </div>
            <CardDescription>
              A breakdown of financials generated dynamically across active orders (excluding Cancelled).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="border border-border p-4 rounded-lg bg-card text-center flex flex-col justify-center min-h-[90px]">
                <span className="text-sm font-semibold text-muted-foreground">Gross Revenue</span>
                <span className="block text-2xl font-bold text-foreground mt-1">{formatINR(financeMetrics.grossRevenue)}</span>
              </div>
              <div className="border border-border p-4 rounded-lg bg-card text-center flex flex-col justify-center min-h-[90px]">
                <span className="text-sm font-semibold text-muted-foreground">Total Discounts Given</span>
                <span className="block text-2xl font-bold text-rose-600 mt-1">-{formatINR(financeMetrics.totalDiscounts)}</span>
              </div>
              <div className="border border-border p-4 rounded-lg bg-card text-center flex flex-col justify-center min-h-[90px]">
                <span className="text-sm font-semibold text-muted-foreground">Net Revenue</span>
                <span className="block text-2xl font-bold text-emerald-600 mt-1">{formatINR(financeMetrics.netRevenue)}</span>
              </div>
              <div className="border border-border p-4 rounded-lg bg-card text-center flex flex-col justify-center min-h-[90px]">
                <span className="text-sm font-semibold text-muted-foreground">Profit Margin</span>
                <span className="block text-2xl font-bold text-blue-600 mt-1">{financeMetrics.profitMargin}%</span>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={downloadReport} className="w-full flex items-center justify-center gap-2">
                <Download className="h-4 w-4" /> Download Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
