import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '../pages/Dashboard';
import { Products } from '../pages/Products';
import { Orders } from '../pages/Orders';
import { Simulator } from '../pages/Simulator';
import { Coupons } from '../pages/Coupons';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/products" element={<Products />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/coupons" element={<Coupons />} />
      <Route path="/simulator" element={<Simulator />} />
    </Routes>
  );
};
