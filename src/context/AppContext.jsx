import React from 'react';
import { ProductProvider } from './ProductContext';
import { OrderProvider } from './OrderContext';
import { SimulationProvider } from './SimulationContext';

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
