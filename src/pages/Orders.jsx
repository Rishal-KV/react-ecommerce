import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../hooks/useApp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';
import {
  Search,
  Plus,
  Trash2,
  Eye,
  FilterX,
  PlusCircle,
  MinusCircle,
  ShoppingBag,
  Ticket,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export const Orders = () => {
  const {
    orders,
    products,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    isValidTransition,
    calculateCartDetails,
    coupons
  } = useApp();

  const buy2Get1Coupon = useMemo(() => {
    return coupons?.find(c => c.type === 'Buy2Get1' && c.status === 'Active');
  }, [coupons]);

  // Filters State
  const [searchCustomer, setSearchCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  // Dialogs State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Create Order Form State
  const [customerName, setCustomerName] = useState('');
  const [cartItems, setCartItems] = useState([]); // [{ id, name, price, quantity }]
  const [couponCode, setCouponCode] = useState('');

  // Selection helper in form
  const [selectedProductId, setSelectedProductId] = useState('');
  const [addQuantity, setAddQuantity] = useState(1);
  const [formError, setFormError] = useState('');

  // Reset Create Form
  const resetCreateForm = useCallback(() => {
    setCustomerName('');
    setCartItems([]);
    setCouponCode('');
    setSelectedProductId('');
    setAddQuantity(1);
    setFormError('');
  }, []);

  // Filtered active products (only active and in stock products can be added to new orders)
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status === 'Active');
  }, [products]);

  // Selected product details for stock hints
  const targetProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Add Item to Draft Cart
  const handleAddItemToCart = () => {
    if (!selectedProductId) {
      setFormError('Please select a product.');
      return;
    }

    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod) return;

    if (prod.stock <= 0) {
      setFormError(`"${prod.name}" is out of stock.`);
      return;
    }

    const qty = Number(addQuantity);
    if (isNaN(qty) || qty <= 0 || !Number.isInteger(qty)) {
      setFormError('Quantity must be a positive whole number.');
      return;
    }

    // Check if item already exists in cart to aggregate quantity
    const existingItem = cartItems.find((item) => item.id === selectedProductId);
    const existingQty = existingItem ? existingItem.quantity : 0;
    const totalRequestedQty = existingQty + qty;

    if (totalRequestedQty > prod.stock) {
      setFormError(`Cannot request ${totalRequestedQty} units. Only ${prod.stock} units are in stock.`);
      return;
    }

    if (existingItem) {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === selectedProductId ? { ...item, quantity: totalRequestedQty } : item
        )
      );
    } else {
      setCartItems((prev) => [
        ...prev,
        {
          id: prod.id,
          name: prod.name,
          price: prod.price,
          category: prod.category, // needed for BUY2GET1 category validation
          quantity: qty,
        },
      ]);
    }

    setFormError('');
    setSelectedProductId('');
    setAddQuantity(1);
  };

  // Adjust cart item quantity inline
  const handleAdjustCartQty = (id, change) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const prod = products.find((p) => p.id === id);
    if (!prod) return;

    const newQty = item.quantity + change;

    if (newQty <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }

    if (newQty > prod.stock) {
      setFormError(`Only ${prod.stock} units are available for ${prod.name}.`);
      return;
    }

    setCartItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: newQty } : i))
    );
    setFormError('');
  };

  // Remove Item from Draft Cart
  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Real-time calculations of draft cart (Challenge 2, 4)
  const cartSummary = useMemo(() => {
    return calculateCartDetails(cartItems, couponCode);
  }, [cartItems, couponCode, calculateCartDetails]);

  // Submit New Order
  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Customer Name is mandatory.');
      return;
    }

    if (cartItems.length === 0) {
      setFormError('Cart is empty. Please add at least one product.');
      return;
    }

    // Second validation of coupon eligibility
    if (cartSummary.couponError && couponCode.trim() !== '') {
      setFormError(`Please resolve coupon error before placing order: ${cartSummary.couponError}`);
      return;
    }

    try {
      const orderPayload = {
        customerName: customerName.trim(),
        products: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        couponCode: couponCode.trim().toUpperCase(),
        subtotal: cartSummary.subtotal,
        discount: cartSummary.discount,
        tax: cartSummary.tax,
        shippingCharge: cartSummary.shippingCharge,
        grandTotal: cartSummary.grandTotal,
      };

      createOrder(orderPayload);
      setIsCreateOpen(false);
      resetCreateForm();
    } catch (err) {
      setFormError(err.message || 'Error occurred while placing the order.');
    }
  };

  // Update Status and handle errors
  const handleStatusChange = (orderId, newStatus) => {
    try {
      updateOrderStatus(orderId, newStatus);
    } catch (err) {
      alert(err.message || 'Status transition is invalid.');
    }
  };

  // Cancel order shortcut
  const handleCancelOrder = (orderId) => {
    if (window.confirm(`Are you sure you want to cancel order ${orderId}?`)) {
      try {
        cancelOrder(orderId);
      } catch (err) {
        alert(err.message || 'Could not cancel this order.');
      }
    }
  };

  // Filtered Orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // 1. Search Customer Name
      const matchesCustomer = o.customerName.toLowerCase().includes(searchCustomer.toLowerCase());

      // 2. Filter Status
      const matchesStatus = filterStatus === '' || o.status === filterStatus;

      // 3. Date Range
      let matchesDate = true;
      if (startDate) {
        const orderDate = new Date(o.createdAt);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && orderDate >= start;
      }
      if (endDate) {
        const orderDate = new Date(o.createdAt);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && orderDate <= end;
      }

      // 4. Amount Range
      let matchesAmount = true;
      if (minAmount) {
        matchesAmount = matchesAmount && o.grandTotal >= Number(minAmount);
      }
      if (maxAmount) {
        matchesAmount = matchesAmount && o.grandTotal <= Number(maxAmount);
      }

      return matchesCustomer && matchesStatus && matchesDate && matchesAmount;
    });
  }, [orders, searchCustomer, filterStatus, startDate, endDate, minAmount, maxAmount]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchCustomer('');
    setFilterStatus('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  // Open View Order Details
  const handleOpenView = (order) => {
    setSelectedOrder(order);
    setIsViewOpen(true);
  };

  // Format currency helper
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Badge variants for status mapping
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="warning">{status}</Badge>;
      case 'Processing':
        return <Badge variant="info">{status}</Badge>;
      case 'Shipped':
        return <Badge variant="default" className="bg-white text-violet-600 border border-violet-200 dark:bg-violet-900/30 dark:text-violet-400 dark:border-transparent">{status}</Badge>;
      case 'Delivered':
        return <Badge variant="success">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Order Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Dispatch items, change delivery workflows, and configure live discounts.
          </p>
        </div>
        <Button onClick={() => { resetCreateForm(); setIsCreateOpen(true); }} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create New Order</span>
        </Button>
      </div>

      {/* Advanced Search and Filters Panel */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-3">
            {/* Customer Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Search Customer</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by customer name..."
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Order Status</label>
              <Select
                placeholder="All Statuses"
                options={[
                  { value: 'Pending', label: 'Pending' },
                  { value: 'Processing', label: 'Processing' },
                  { value: 'Shipped', label: 'Shipped' },
                  { value: 'Delivered', label: 'Delivered' },
                  { value: 'Cancelled', label: 'Cancelled' }
                ]}
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              />
            </div>

            {/* Date Range Filters */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Date Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 mt-4 pt-4 border-t border-border">
            {/* Amount Range Filter */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Order Amount Range (₹)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min Amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="text-xs"
                />
                <Input
                  type="number"
                  placeholder="Max Amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Reset Filter Button */}
            <div className="flex items-end justify-end">
              {(searchCustomer || filterStatus || startDate || endDate || minAmount || maxAmount) && (
                <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs flex items-center gap-1.5">
                  <FilterX className="h-3.5 w-3.5" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Directory Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Orders Directory</CardTitle>
          <CardDescription>
            Displaying {filteredOrders.length} of {orders.length} orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6 sm:pt-0">
          {filteredOrders.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead className="text-right">Grand Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Modify Workflow</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-semibold text-foreground font-mono text-xs">{order.id}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{order.customerName}</TableCell>
                    <TableCell className="max-w-[200px]">
                      <div className="text-xs truncate" title={order.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}>
                        {order.products.map(p => `${p.name} (x${p.quantity})`).join(', ')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-foreground">
                      {formatINR(order.grandTotal)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-xs rounded border border-border p-1 bg-background text-foreground ${order.status === 'Cancelled' || order.status === 'Delivered' ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                        disabled={order.status === 'Cancelled' || order.status === 'Delivered'}
                      >
                        {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
                          <option
                            key={st}
                            value={st}
                            disabled={!isValidTransition(order.status, st)}
                          >
                            {st}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenView(order)}
                          title="View Details"
                          className="h-8 w-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-500/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-16">
              No orders found matching the filter criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE ORDER DIALOG */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Order"
        className="max-w-3xl"
      >
        <form onSubmit={handlePlaceOrder} className="space-y-4">
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Order Placement Warning</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          {/* Customer Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Customer Name *</label>
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer's full name"
              required
            />
          </div>

          {/* Add Product To Cart Section */}
          <div className="border border-border rounded-lg p-4 bg-muted/20 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <ShoppingBag className="h-3.5 w-3.5" /> Add Products
            </h3>

            <div className="grid gap-3 sm:grid-cols-3 items-end">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Select Product</label>
                <Select
                  placeholder="Choose Product..."
                  options={activeProducts.map((p) => ({
                    value: p.id,
                    label: `${p.name} (Stock: ${p.stock}) - ${formatINR(p.price)}`,
                  }))}
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Quantity {targetProduct && `(Max: ${targetProduct.stock})`}
                </label>
                <Input
                  type="number"
                  min="1"
                  value={addQuantity}
                  onChange={(e) => setAddQuantity(e.target.value)}
                />
              </div>

              <Button type="button" variant="outline" onClick={handleAddItemToCart} className="w-full">
                Add to Cart
              </Button>
            </div>

            {/* Cart Hint for Dynamic BUY2GET1 */}
            {buy2Get1Coupon && cartItems.some(item => item.category.toLowerCase() === buy2Get1Coupon.targetCategory.toLowerCase() && item.quantity < 3) && (
              <p className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold animate-pulse">
                💡 Tip: Buy 3 {buy2Get1Coupon.targetCategory.toLowerCase()} to get 1 free! Add more units to activate {buy2Get1Coupon.code} coupon.
              </p>
            )}
          </div>

          {/* Cart Items List */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">Order Items List</label>
            {cartItems.length > 0 ? (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground uppercase font-bold text-[10px] border-b border-border">
                    <tr>
                      <th className="p-3">Product</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Total</th>
                      <th className="p-3 text-center">Remove</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {cartItems.map((item) => (
                      <tr key={item.id}>
                        <td className="p-3">
                          <span className="font-semibold text-foreground">{item.name}</span>
                          <span className="text-[9px] text-muted-foreground block">{item.category}</span>
                        </td>
                        <td className="p-3 text-right">{formatINR(item.price)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleAdjustCartQty(item.id, -1)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <MinusCircle className="h-4 w-4" />
                            </button>
                            <span className="font-bold text-foreground w-6 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleAdjustCartQty(item.id, 1)}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <PlusCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                        <td className="p-3 text-right font-medium text-foreground">
                          {formatINR(item.price * item.quantity)}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-xs text-muted-foreground border border-dashed border-border rounded-lg">
                No items added to cart. Choose a product and add.
              </div>
            )}
          </div>

          {/* Coupon Section */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground flex items-center gap-1">
                <Ticket className="h-4 w-4 text-violet-500" /> Apply Coupon
              </label>
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="e.g. SAVE10, FLAT500, BUY2GET1"
              />

              {/* Coupon Engine Feedbacks */}
              {cartSummary.couponSuccess && (
                <span className="text-xs text-emerald-600 block mt-1 font-medium">{cartSummary.couponSuccess}</span>
              )}
              {cartSummary.couponError && (
                <span className="text-xs text-red-500 block mt-1">{cartSummary.couponError}</span>
              )}
            </div>

            {/* Real-Time Calculation breakdown (Challenge 4, Requirements 8) */}
            <div className="border border-border rounded-lg p-3 bg-muted/10 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="text-foreground">{formatINR(cartSummary.subtotal)}</span>
              </div>
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon Discount:</span>
                <span>-{formatINR(cartSummary.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GST Tax (18%):</span>
                <span className="text-foreground">{formatINR(cartSummary.tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground flex items-center gap-1">
                  Shipping:
                  {cartSummary.shippingCharge === 0 && cartSummary.subtotal > 0 && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 px-1 rounded">Free</span>
                  )}
                </span>
                <span className="text-foreground">
                  {cartSummary.shippingCharge > 0 ? formatINR(cartSummary.shippingCharge) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between border-t border-border pt-1.5 text-sm font-bold">
                <span className="text-foreground">Grand Total:</span>
                <span className="text-primary">{formatINR(cartSummary.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Form Submit */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Place Order
            </Button>
          </div>
        </form>
      </Dialog>

      {/* VIEW ORDER DETAILS DIALOG */}
      <Dialog
        isOpen={isViewOpen}
        onClose={() => setIsViewOpen(false)}
        title={selectedOrder ? `Order Details - ${selectedOrder.id}` : 'Order Details'}
      >
        {selectedOrder && (
          <div className="space-y-6 text-sm text-foreground">
            {/* Meta header */}
            <div className="flex flex-col sm:flex-row justify-between border-b border-border pb-4 gap-2">
              <div>
                <span className="text-xs text-muted-foreground block">Customer Name</span>
                <span className="text-base font-bold">{selectedOrder.customerName}</span>
              </div>
              <div className="sm:text-right">
                <span className="text-xs text-muted-foreground block">Order Placed</span>
                <span className="font-semibold">
                  {new Date(selectedOrder.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Workflow state */}
            <div className="flex items-center gap-2 p-3 bg-muted/20 border border-border rounded-lg">
              <span className="font-medium text-xs text-muted-foreground">Workflow Stage:</span>
              {getStatusBadge(selectedOrder.status)}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <div className="text-xs text-muted-foreground">
                {selectedOrder.status === 'Cancelled' ? (
                  <span className="text-red-500 font-medium">This order was cancelled. Inventory rolled back.</span>
                ) : selectedOrder.status === 'Delivered' ? (
                  <span className="text-green-500 font-medium">Order successfully delivered. Workflow complete.</span>
                ) : (
                  <span>Next states can be set in the tables menu.</span>
                )}
              </div>
            </div>

            {/* Product items in order */}
            <div className="space-y-2">
              <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground block">Products</span>
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted text-muted-foreground font-bold">
                    <tr>
                      <th className="p-3">Product Name</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Quantity</th>
                      <th className="p-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {selectedOrder.products.map((p, index) => (
                      <tr key={index}>
                        <td className="p-3 font-semibold text-foreground">{p.name}</td>
                        <td className="p-3 text-right">{formatINR(p.price)}</td>
                        <td className="p-3 text-center font-bold">{p.quantity}</td>
                        <td className="p-3 text-right font-semibold">{formatINR(p.price * p.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Invoice Breakdown */}
            <div className="w-full max-w-xs ml-auto border border-border rounded-lg p-3 space-y-1.5 bg-muted/5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>{formatINR(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs text-emerald-600 font-medium">
                <span>Discount applied ({selectedOrder.couponCode || 'None'}):</span>
                <span>-{formatINR(selectedOrder.discount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">GST (18%):</span>
                <span>{formatINR(selectedOrder.tax)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Shipping:</span>
                <span>{selectedOrder.shippingCharge > 0 ? formatINR(selectedOrder.shippingCharge) : '₹0'}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1.5 text-primary">
                <span>Grand Total:</span>
                <span>{formatINR(selectedOrder.grandTotal)}</span>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t border-border mt-4">
              <Button onClick={() => setIsViewOpen(false)}>Close Summary</Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
