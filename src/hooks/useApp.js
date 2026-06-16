import { useProducts } from './useProducts';
import { useOrders } from './useOrders';
import { useSimulation } from './useSimulation';

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
