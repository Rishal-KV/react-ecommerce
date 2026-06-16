import React, { createContext, useState, useCallback } from 'react';

export const SimulationContext = createContext();

export const SimulationProvider = ({ children }) => {
  const [simStock, setSimStock] = useState(50);
  const [simLog, setSimLog] = useState([]);

  const runSimulation = useCallback((userAQty, userBQty) => {
    setSimStock(50);
    const log = [];
    log.push({ time: new Date().toLocaleTimeString(), message: 'Simulation started with Current Stock = 50 units.' });
    log.push({ time: new Date().toLocaleTimeString(), message: `User A attempts to purchase ${userAQty} units.` });
    log.push({ time: new Date().toLocaleTimeString(), message: `User B attempts to purchase ${userBQty} units.` });

    let stockRemaining = 50;

    log.push({ time: new Date().toLocaleTimeString(), message: 'Transaction A: Checking stock availability...' });
    if (stockRemaining >= userAQty) {
      stockRemaining -= userAQty;
      log.push({ time: new Date().toLocaleTimeString(), message: `Transaction A: APPROVED! Reserved ${userAQty} units. Stock level -> ${stockRemaining} units.`, type: 'success' });
    } else {
      log.push({ time: new Date().toLocaleTimeString(), message: `Transaction A: REJECTED! Insufficient stock. Requested ${userAQty}, available: ${stockRemaining}.`, type: 'error' });
    }

    log.push({ time: new Date().toLocaleTimeString(), message: 'Transaction B: Checking stock availability...' });
    if (stockRemaining >= userBQty) {
      stockRemaining -= userBQty;
      log.push({ time: new Date().toLocaleTimeString(), message: `Transaction B: APPROVED! Reserved ${userBQty} units. Stock level -> ${stockRemaining} units.`, type: 'success' });
    } else {
      log.push({ time: new Date().toLocaleTimeString(), message: `Transaction B: REJECTED! Insufficient stock. Requested ${userBQty}, available: ${stockRemaining}.`, type: 'error' });
    }

    log.push({ time: new Date().toLocaleTimeString(), message: `Simulation complete. Final Stock: ${stockRemaining} units.` });

    setSimStock(stockRemaining);
    setSimLog(log);
  }, []);

  return (
    <SimulationContext.Provider
      value={{
        simStock,
        simLog,
        runSimulation
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};
