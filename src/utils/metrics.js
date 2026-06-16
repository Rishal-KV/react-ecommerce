/**
 * Calculates revenue for sub-periods (today, weekly, monthly).
 * @param {Array} orders - List of all orders
 * @returns {Object} revenue metrics
 */
export const calculateRevenueMetrics = (orders) => {
  const now = new Date();
  const activeOrders = orders.filter((o) => o.status !== 'Cancelled');

  const isToday = (dateStr) => {
    const d = new Date(dateStr);
    return d.toDateString() === now.toDateString();
  };

  const isThisWeek = (dateStr) => {
    const d = new Date(dateStr);
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const isThisMonth = (dateStr) => {
    const d = new Date(dateStr);
    const diffTime = Math.abs(now - d);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30;
  };

  const todayRevenue = activeOrders
    .filter((o) => isToday(o.createdAt))
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const weeklyRevenue = activeOrders
    .filter((o) => isThisWeek(o.createdAt))
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const monthlyRevenue = activeOrders
    .filter((o) => isThisMonth(o.createdAt))
    .reduce((sum, o) => sum + o.grandTotal, 0);

  return {
    today: todayRevenue,
    weekly: weeklyRevenue,
    monthly: monthlyRevenue
  };
};

/**
 * Computes order count metrics by status.
 * @param {Array} orders - List of all orders
 * @returns {Object} order count metrics
 */
export const calculateOrderMetrics = (orders) => {
  const total = orders.length;
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const completed = orders.filter((o) => o.status === 'Delivered').length;
  const processing = orders.filter((o) => o.status === 'Processing').length;
  const shipped = orders.filter((o) => o.status === 'Shipped').length;
  const cancelled = orders.filter((o) => o.status === 'Cancelled').length;

  return {
    total,
    pending,
    completed,
    processing,
    shipped,
    cancelled
  };
};

/**
 * Computes top 5 best selling products with tie-handling rank logic.
 * @param {Array} orders - List of all orders
 * @param {Array} products - List of all products
 * @returns {Array} ranked list of top products
 */
export const calculateTopProducts = (orders, products) => {
  const salesMap = {};
  
  products.forEach((p) => {
    salesMap[p.id] = {
      product: p,
      quantity: 0
    };
  });

  orders.forEach((order) => {
    if (order.status !== 'Cancelled') {
      order.products.forEach((item) => {
        if (salesMap[item.id]) {
          salesMap[item.id].quantity += item.quantity;
        } else {
          salesMap[item.id] = {
            product: { id: item.id, name: item.name, price: item.price, sku: 'N/A', category: 'Deleted' },
            quantity: item.quantity
          };
        }
      });
    }
  });

  products.forEach((p) => {
    if (salesMap[p.id]) {
      salesMap[p.id].quantity += (p.soldCount || 0);
    }
  });

  const list = Object.values(salesMap).sort((a, b) => b.quantity - a.quantity);

  let currentRank = 1;
  let prevQuantity = null;
  let rankOffset = 0;

  const rankedList = list.map((item, index) => {
    if (prevQuantity !== null && item.quantity < prevQuantity) {
      currentRank = currentRank + rankOffset;
      rankOffset = 1;
    } else if (prevQuantity !== null && item.quantity === prevQuantity) {
      rankOffset += 1;
    } else {
      rankOffset = 1;
    }
    
    prevQuantity = item.quantity;

    return {
      ...item,
      rank: currentRank
    };
  });

  return rankedList.filter(item => item.rank <= 5 && item.quantity > 0);
};
