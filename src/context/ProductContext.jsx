import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

const ProductContext = createContext();

const INITIAL_PRODUCTS = [
  { id: '1', name: 'iPhone 15 Pro', sku: 'PH-IPH15P', price: 120000, stock: 15, category: 'Electronics', status: 'Active', soldCount: 24 },
  { id: '2', name: 'Samsung Galaxy S24', sku: 'PH-GALS24', price: 95000, stock: 8, category: 'Electronics', status: 'Active', soldCount: 25 },
  { id: '3', name: 'Sony WH-1000XM5 Headphones', sku: 'AUD-SONYXM5', price: 30000, stock: 20, category: 'Audio', status: 'Active', soldCount: 15 },
  { id: '4', name: 'Keychron Mechanical Keyboard', sku: 'KB-KEYCHRON', price: 8000, stock: 5, category: 'Accessories', status: 'Active', soldCount: 18 },
  { id: '5', name: 'Logitech Wireless Mouse', sku: 'MS-LOGITECH', price: 4500, stock: 3, category: 'Accessories', status: 'Active', soldCount: 18 },
  { id: '6', name: 'Leather Passport Wallet', sku: 'WAL-LEATHER', price: 2500, stock: 12, category: 'Accessories', status: 'Inactive', soldCount: 5 },
  { id: '7', name: 'Anker USB-C Hub', sku: 'HUB-ANKER', price: 3500, stock: 25, category: 'Accessories', status: 'Active', soldCount: 30 }
];

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('categories');
    if (saved) return JSON.parse(saved);
    const initialCats = ['Electronics', 'Audio', 'Accessories'];
    return initialCats;
  });

  useEffect(() => {
    localStorage.setItem('products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('categories', JSON.stringify(categories));
  }, [categories]);

  const addProduct = useCallback((product) => {
    setProducts((prev) => [
      ...prev,
      {
        ...product,
        id: Date.now().toString(),
        soldCount: 0,
        price: Number(product.price),
        stock: Number(product.stock),
      }
    ]);
  }, []);

  const editProduct = useCallback((updatedProduct) => {
    setProducts((prev) =>
      prev.map((prod) => (prod.id === updatedProduct.id ? {
        ...updatedProduct,
        price: Number(updatedProduct.price),
        stock: Number(updatedProduct.stock),
      } : prod))
    );
  }, []);

  const deleteProduct = useCallback((id) => {
    setProducts((prev) => prev.filter((prod) => prod.id !== id));
  }, []);

  const isSkuUnique = useCallback((sku, excludeProductId = null) => {
    return !products.some(
      (prod) => prod.sku.toLowerCase() === sku.trim().toLowerCase() && prod.id !== excludeProductId
    );
  }, [products]);

  const addCategory = useCallback((newCat) => {
    if (!newCat) return;
    const clean = newCat.replace(/[^a-zA-Z0-9]/g, '');
    if (!clean) return;
    const formatted = clean.charAt(0).toUpperCase() + clean.slice(1);
    setCategories((prev) => {
      if (prev.some((c) => c.toLowerCase() === formatted.toLowerCase())) {
        return prev;
      }
      return [...prev, formatted];
    });
  }, []);

  const deleteCategory = useCallback((catName) => {
    const isUsed = products.some(p => p.category.toLowerCase() === catName.toLowerCase());
    if (isUsed) {
      throw new Error(`Category "${catName}" is currently assigned to products and cannot be deleted.`);
    }
    setCategories((prev) => prev.filter((c) => c.toLowerCase() !== catName.toLowerCase()));
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock < 10 && p.status === 'Active');
  }, [products]);

  return (
    <ProductContext.Provider
      value={{
        products,
        setProducts,
        addProduct,
        editProduct,
        deleteProduct,
        isSkuUnique,
        categories,
        addCategory,
        deleteCategory,
        lowStockProducts
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
