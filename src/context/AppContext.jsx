import React from 'react';
import { ProductProvider, useProducts } from './ProductContext';
import { OrderProvider, useOrders } from './OrderContext';
import { SimulationProvider, useSimulation } from './SimulationContext';

// Aggregate Provider
export const AppProvider = ({ children }) => {
  return (
    <ProductProvider>
      <OrderProvider>
        <SimulationProvider>
          {children}
        </SimulationProvider>
      </OrderProvider>
    </ProductProvider>
  );
};

// Aggregate Hook
export const useApp = () => {
  const productData = useProducts();
  const orderData = useOrders();
  const simulationData = useSimulation();

  return {
    ...productData,
    ...orderData,
    ...simulationData
  };
};
