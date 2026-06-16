import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useProducts } from './ProductContext';
import { 
  calculateRevenueMetrics, 
  calculateOrderMetrics, 
  calculateTopProducts 
} from '../utils/metrics';

const OrderContext = createContext();

const getPastDateISO = (daysAgo) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

const INITIAL_ORDERS = [
  {
    id: 'ORD-1001',
    customerName: 'Aarav Sharma',
    products: [
      { id: '1', name: 'iPhone 15 Pro', price: 120000, quantity: 1 },
      { id: '7', name: 'Anker USB-C Hub', price: 3500, quantity: 1 }
    ],
    couponCode: 'SAVE10',
    subtotal: 123500,
    discount: 12350,
    tax: 20007,
    shippingCharge: 0,
    grandTotal: 131157,
    status: 'Delivered',
    createdAt: getPastDateISO(0)
  },
  {
    id: 'ORD-1002',
    customerName: 'Ananya Iyer',
    products: [
      { id: '4', name: 'Keychron Mechanical Keyboard', price: 8000, quantity: 3 }
    ],
    couponCode: 'BUY2GET1',
    subtotal: 24000,
    discount: 8000,
    tax: 2880,
    shippingCharge: 0,
    grandTotal: 18880,
    status: 'Shipped',
    createdAt: getPastDateISO(2)
  },
  {
    id: 'ORD-1003',
    customerName: 'Rahul Verma',
    products: [
      { id: '3', name: 'Sony WH-1000XM5 Headphones', price: 30000, quantity: 1 }
    ],
    couponCode: 'FLAT500',
    subtotal: 30000,
    discount: 500,
    tax: 5310,
    shippingCharge: 0,
    grandTotal: 34810,
    status: 'Processing',
    createdAt: getPastDateISO(5)
  },
  {
    id: 'ORD-1004',
    customerName: 'Priya Patel',
    products: [
      { id: '5', name: 'Logitech Wireless Mouse', price: 4500, quantity: 1 }
    ],
    couponCode: '',
    subtotal: 4500,
    discount: 0,
    tax: 810,
    shippingCharge: 100,
    grandTotal: 5410,
    status: 'Pending',
    createdAt: getPastDateISO(12)
  },
  {
    id: 'ORD-1005',
    customerName: 'Vikram Singh',
    products: [
      { id: '2', name: 'Samsung Galaxy S24', price: 95000, quantity: 1 }
    ],
    couponCode: 'SAVE10',
    subtotal: 95000,
    discount: 9500,
    tax: 15390,
    shippingCharge: 0,
    grandTotal: 100890,
    status: 'Cancelled',
    createdAt: getPastDateISO(1)
  },
  {
    id: 'ORD-1006',
    customerName: 'Neha Reddy',
    products: [
      { id: '3', name: 'Sony WH-1000XM5 Headphones', price: 30000, quantity: 2 }
    ],
    couponCode: 'SAVE10',
    subtotal: 60000,
    discount: 6000,
    tax: 9720,
    shippingCharge: 0,
    grandTotal: 63720,
    status: 'Delivered',
    createdAt: getPastDateISO(25)
  },
  {
    id: 'ORD-1007',
    customerName: 'Aditya Sen',
    products: [
      { id: '7', name: 'Anker USB-C Hub', price: 3500, quantity: 2 }
    ],
    couponCode: '',
    subtotal: 7000,
    discount: 0,
    tax: 1260,
    shippingCharge: 0,
    grandTotal: 8260,
    status: 'Delivered',
    createdAt: getPastDateISO(40)
  }
];

const INITIAL_COUPONS = [
  {
    code: 'SAVE10',
    type: 'Percentage',
    value: 10,
    minCartValue: 10000,
    targetCategory: '',
    expiryDate: '2030-12-31',
    status: 'Active',
    description: '10% off on minimum cart value of ₹10,000'
  },
  {
    code: 'FLAT500',
    type: 'Flat',
    value: 500,
    minCartValue: 5000,
    targetCategory: '',
    expiryDate: '2030-12-31',
    status: 'Active',
    description: '₹500 off on minimum cart value of ₹5,000'
  },
  {
    code: 'BUY2GET1',
    type: 'Buy2Get1',
    value: 0,
    minCartValue: 0,
    targetCategory: 'Accessories',
    expiryDate: '2030-12-31',
    status: 'Active',
    description: 'Buy 2 Get 1 Free on Accessories category'
  }
];

export const OrderProvider = ({ children }) => {
  const { products, setProducts } = useProducts();
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('coupons');
    return saved ? JSON.parse(saved) : INITIAL_COUPONS;
  });

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('coupons', JSON.stringify(coupons));
  }, [coupons]);

  const isValidTransition = useCallback((currentStatus, nextStatus) => {
    if (currentStatus === nextStatus) return true;
    if (currentStatus === 'Delivered' && (nextStatus === 'Pending' || nextStatus === 'Processing')) {
      return false;
    }
    if (currentStatus === 'Shipped' && nextStatus === 'Pending') {
      return false;
    }
    if (nextStatus === 'Cancelled' && (currentStatus === 'Delivered')) {
      return false;
    }
    return true;
  }, []);

  const createOrder = useCallback((orderData) => {
    const newOrderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      ...orderData,
      id: newOrderId,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    let hasStockIssue = false;
    const stockIssues = [];

    setProducts((currentProducts) => {
      for (const item of orderData.products) {
        const product = currentProducts.find((p) => p.id === item.id);
        if (!product) {
          hasStockIssue = true;
          stockIssues.push(`Product ${item.name} not found.`);
        } else if (product.status !== 'Active') {
          hasStockIssue = true;
          stockIssues.push(`Product ${item.name} is Inactive.`);
        } else if (product.stock < item.quantity) {
          hasStockIssue = true;
          stockIssues.push(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
      }

      if (hasStockIssue) {
        throw new Error(stockIssues.join(' | '));
      }

      return currentProducts.map((p) => {
        const orderItem = orderData.products.find((item) => item.id === p.id);
        if (orderItem) {
          return {
            ...p,
            stock: p.stock - orderItem.quantity,
            soldCount: p.soldCount + orderItem.quantity
          };
        }
        return p;
      });
    });

    setOrders((prev) => [newOrder, ...prev]);
    return newOrderId;
  }, [setProducts]);

  const updateOrderStatus = useCallback((orderId, nextStatus) => {
    setOrders((currentOrders) => {
      const order = currentOrders.find((o) => o.id === orderId);
      if (!order) return currentOrders;

      if (!isValidTransition(order.status, nextStatus)) {
        throw new Error(`Invalid status transition from ${order.status} to ${nextStatus}.`);
      }

      if (nextStatus === 'Cancelled' && order.status !== 'Cancelled') {
        setProducts((currentProducts) =>
          currentProducts.map((p) => {
            const orderItem = order.products.find((item) => item.id === p.id);
            if (orderItem) {
              return {
                ...p,
                stock: p.stock + orderItem.quantity,
                soldCount: Math.max(0, p.soldCount - orderItem.quantity)
              };
            }
            return p;
          })
        );
      }

      if (order.status === 'Cancelled' && nextStatus !== 'Cancelled') {
        let hasStockIssue = false;
        
        setProducts((currentProducts) => {
          for (const item of order.products) {
            const product = currentProducts.find((p) => p.id === item.id);
            if (!product || product.stock < item.quantity) {
              hasStockIssue = true;
            }
          }
          if (hasStockIssue) {
            throw new Error(`Cannot restore order: Insufficient stock.`);
          }
          
          return currentProducts.map((p) => {
            const orderItem = order.products.find((item) => item.id === p.id);
            if (orderItem) {
              return {
                ...p,
                stock: p.stock - orderItem.quantity,
                soldCount: p.soldCount + orderItem.quantity
              };
            }
            return p;
          });
        });
      }

      return currentOrders.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
    });
  }, [isValidTransition, setProducts]);

  const cancelOrder = useCallback((orderId) => {
    updateOrderStatus(orderId, 'Cancelled');
  }, [updateOrderStatus]);

  const addCoupon = useCallback((coupon) => {
    const formattedCode = coupon.code.trim().toUpperCase();
    
    // Check if code is unique
    if (coupons.some((c) => c.code === formattedCode)) {
      throw new Error(`Coupon code "${formattedCode}" already exists.`);
    }

    setCoupons((prev) => [
      ...prev,
      {
        ...coupon,
        code: formattedCode,
        value: Number(coupon.value || 0),
        minCartValue: Number(coupon.minCartValue || 0),
        status: coupon.status || 'Active'
      }
    ]);
  }, [coupons]);

  const deleteCoupon = useCallback((code) => {
    setCoupons((prev) => prev.filter((c) => c.code !== code));
  }, []);

  const toggleCouponStatus = useCallback((code) => {
    setCoupons((prev) =>
      prev.map((c) => (c.code === code ? { ...c, status: c.status === 'Active' ? 'Inactive' : 'Active' } : c))
    );
  }, []);

  const calculateCartDetails = useCallback((cartItems, couponCode) => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    let couponError = '';
    let couponSuccess = '';

    if (couponCode && couponCode.trim() !== '') {
      const code = couponCode.trim().toUpperCase();
      const coupon = coupons.find((c) => c.code === code);

      if (!coupon) {
        couponError = 'Invalid coupon code.';
      } else if (coupon.status !== 'Active') {
        couponError = 'This coupon is inactive.';
      } else {
        // Expiry date validation
        const todayStr = new Date().toISOString().split('T')[0];
        if (coupon.expiryDate && coupon.expiryDate < todayStr) {
          couponError = 'This coupon has expired.';
        } else if (subtotal < coupon.minCartValue) {
          couponError = `${coupon.code} requires a minimum cart value of ₹${coupon.minCartValue.toLocaleString('en-IN')}. Current: ₹${subtotal.toLocaleString('en-IN')}`;
        } else {
          // Calculate discount based on type
          if (coupon.type === 'Percentage') {
            discount = subtotal * (coupon.value / 100);
            couponSuccess = `Coupon ${code} applied successfully! Discount: ₹${discount.toLocaleString('en-IN')} (${coupon.value}% off)`;
          } else if (coupon.type === 'Flat') {
            discount = Math.min(subtotal, coupon.value);
            couponSuccess = `Coupon ${code} applied successfully! Discount: ₹${discount.toLocaleString('en-IN')}`;
          } else if (coupon.type === 'Buy2Get1') {
            const category = coupon.targetCategory || 'Accessories';
            const catItems = cartItems.filter(item => {
              const prod = products.find(p => p.id === item.id);
              return prod && prod.category.toLowerCase() === category.toLowerCase();
            });
            const totalCatQty = catItems.reduce((sum, item) => sum + item.quantity, 0);

            if (totalCatQty < 3) {
              couponError = `BUY2GET1 requires at least 3 items from the "${category}" category. Current quantity: ${totalCatQty}`;
            } else {
              // Calculate Buy 2 Get 1 Free: for every 3 items of target category, cheaper units are free
              const itemPrices = [];
              catItems.forEach(item => {
                for (let i = 0; i < item.quantity; i++) {
                  itemPrices.push(item.price);
                }
              });
              itemPrices.sort((a, b) => a - b);
              const freeQty = Math.floor(itemPrices.length / 3);
              const freeDiscount = itemPrices.slice(0, freeQty).reduce((sum, p) => sum + p, 0);

              discount = freeDiscount;
              couponSuccess = `Coupon ${code} applied successfully! Buy 2 Get 1 Free on ${category}. Discount: ₹${discount.toLocaleString('en-IN')}`;
            }
          } else {
            couponError = 'Unknown coupon type.';
          }
        }
      }
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const tax = Math.round(discountedSubtotal * 0.18);
    const shippingCharge = (discountedSubtotal >= 5000 || subtotal === 0) ? 0 : 100;
    const grandTotal = discountedSubtotal + tax + shippingCharge;

    return {
      subtotal,
      discount,
      tax,
      shippingCharge,
      grandTotal,
      couponError,
      couponSuccess
    };
  }, [coupons, products]);

  const revenueMetrics = useMemo(() => {
    return calculateRevenueMetrics(orders);
  }, [orders]);

  const orderMetrics = useMemo(() => {
    return calculateOrderMetrics(orders);
  }, [orders]);

  const topProducts = useMemo(() => {
    return calculateTopProducts(orders, products);
  }, [orders, products]);

  return (
    <OrderContext.Provider
      value={{
        orders,
        createOrder,
        updateOrderStatus,
        cancelOrder,
        isValidTransition,
        calculateCartDetails,
        coupons,
        addCoupon,
        deleteCoupon,
        toggleCouponStatus,
        revenueMetrics,
        orderMetrics,
        topProducts
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
