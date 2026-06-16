import React, { useState, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Badge } from '../components/ui/Badge';
import { Dialog } from '../components/ui/Dialog';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';
import { Search, Plus, Edit2, Trash2, FilterX, HelpCircle, AlertCircle } from 'lucide-react';

export const Products = () => {
  const { products, addProduct, editProduct, deleteProduct, isSkuUnique, categories, addCategory, deleteCategory } = useApp();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Dialog / Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null means adding a new product
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState(null);

  // Form Fields State
  const [formName, setFormName] = useState('');
  const [formSku, setFormSku] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formStock, setFormStock] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formStatus, setFormStatus] = useState('Active');
  
  // Dynamic category entry states inside modal
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);

  const handleAddNewCategory = () => {
    const formatted = newCategoryInput.trim();
    if (!formatted) return;

    const categoryRegex = /^[A-Z][a-zA-Z0-9]*$/;
    if (!categoryRegex.test(formatted)) {
      setFormErrors(prev => ({
        ...prev,
        category: 'Must start with a capital and contain no spaces/special chars.'
      }));
      return;
    }

    addCategory(formatted);
    setFormCategory(formatted);
    setNewCategoryInput('');
    setIsAddingNewCategory(false);
  };

  // Manage category panel state (sidebar)
  const [manageCategoryInput, setManageCategoryInput] = useState('');
  const [categoryError, setCategoryError] = useState('');

  const handleManageAddCategory = () => {
    const formatted = manageCategoryInput.trim();
    if (!formatted) return;

    const categoryRegex = /^[A-Z][a-zA-Z0-9]*$/;
    if (!categoryRegex.test(formatted)) {
      setCategoryError('Must start with a capital and contain no spaces/special chars.');
      return;
    }

    if (categories.some(c => c.toLowerCase() === formatted.toLowerCase())) {
      setCategoryError('Category already exists.');
      return;
    }
    addCategory(formatted);
    setManageCategoryInput('');
    setCategoryError('');
  };

  const handleManageDeleteCategory = (catName) => {
    try {
      deleteCategory(catName);
      setCategoryError('');
    } catch (err) {
      setCategoryError(err.message || 'Could not delete category.');
    }
  };

  // Form Errors State
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Reset Form
  const resetForm = useCallback(() => {
    setFormName('');
    setFormSku('');
    setFormPrice('');
    setFormStock('');
    setFormCategory('');
    setFormStatus('Active');
    setFormErrors({});
    setGeneralError('');
    setEditingProduct(null);
  }, []);

  // Open Dialog for Add
  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  // Open Dialog for Edit
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormSku(product.sku);
    setFormPrice(product.price.toString());
    setFormStock(product.stock.toString());
    setFormCategory(product.category);
    setFormStatus(product.status);
    setFormErrors({});
    setGeneralError('');
    setIsDialogOpen(true);
  };

  // Handle Form Submit (Add / Edit)
  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    // 1. Mandatory Product Name
    if (!formName.trim()) {
      errors.name = 'Product name is mandatory.';
    }

    // 2. Unique SKU
    if (!formSku.trim()) {
      errors.sku = 'SKU is mandatory.';
    } else if (!isSkuUnique(formSku, editingProduct?.id)) {
      errors.sku = 'SKU must be unique. This SKU is already taken by another product.';
    }

    // 3. Price Validation
    const priceNum = Number(formPrice);
    if (formPrice === '') {
      errors.price = 'Price is mandatory.';
    } else if (isNaN(priceNum) || priceNum < 0) {
      errors.price = 'Price cannot be negative.';
    }

    // 4. Stock Validation
    const stockNum = Number(formStock);
    if (formStock === '') {
      errors.stock = 'Stock quantity is mandatory.';
    } else if (isNaN(stockNum) || !Number.isInteger(stockNum) || stockNum < 0) {
      errors.stock = 'Stock must be a non-negative whole number.';
    }

    // Category Validation
    if (!formCategory.trim()) {
      errors.category = 'Category is mandatory.';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const productData = {
        name: formName.trim(),
        sku: formSku.trim().toUpperCase(),
        price: priceNum,
        stock: stockNum,
        category: formCategory.trim(),
        status: formStatus
      };

      if (editingProduct) {
        editProduct({ ...productData, id: editingProduct.id });
      } else {
        addProduct(productData);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setGeneralError(err.message || 'An error occurred while saving the product.');
    }
  };

  // Handle Delete with verification
  const handleDeleteConfirm = () => {
    if (deleteConfirmProduct) {
      deleteProduct(deleteConfirmProduct.id);
      setDeleteConfirmProduct(null);
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
  };

  // Filtered Products using useMemo for performance optimization
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      const matchesSearch = 
        prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prod.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = selectedCategory === '' || prod.category === selectedCategory;
      const matchesStatus = selectedStatus === '' || prod.status === selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchTerm, selectedCategory, selectedStatus]);

  // Format currency helper
  const formatINR = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Product Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create, update, and inspect your warehouse products.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </Button>
      </div>

      {/* Search and Filters panel */}
      <Card>
        <CardContent className="p-4">
          <div className="grid gap-4 md:grid-cols-4 items-end">
            <div className="md:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Search Products</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Category</label>
              <Select
                placeholder="All Categories"
                options={categories.map(cat => ({ value: cat, label: cat }))}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Status</label>
              <Select
                placeholder="All Statuses"
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' }
                ]}
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              />
            </div>
          </div>

          {(searchTerm || selectedCategory || selectedStatus) && (
            <div className="flex justify-end mt-4">
              <Button variant="ghost" size="sm" onClick={handleResetFilters} className="text-xs flex items-center gap-1.5">
                <FilterX className="h-3.5 w-3.5" />
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products and Categories layout grid */}
      <div className="grid gap-6 lg:grid-cols-4 items-start">
        {/* Products Table Card */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Products Directory</CardTitle>
              <CardDescription>
                Showing {filteredProducts.length} of {products.length} registered products.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-6 sm:pt-0">
              {filteredProducts.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Available Stock</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProducts.map((prod) => (
                      <TableRow key={prod.id}>
                        <TableCell>
                          <div className="font-semibold text-foreground">{prod.name}</div>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">{prod.sku}</code>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">{prod.category}</span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-foreground">
                          {formatINR(prod.price)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`font-semibold ${prod.stock < 10 && prod.status === 'Active' ? 'text-red-500 font-bold' : ''}`}>
                            {prod.stock}
                          </span>
                          {prod.stock < 10 && prod.status === 'Active' && (
                            <span className="text-[10px] text-red-500 block">Low stock!</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={prod.status === 'Active' ? 'success' : 'danger'}>
                            {prod.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(prod)}
                              title="Edit Product"
                              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-500/10"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteConfirmProduct(prod)}
                              title="Delete Product"
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-sm text-muted-foreground py-16">
                  No products found matching the filter criteria.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Categories Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Manage Categories</CardTitle>
              <CardDescription className="text-xs">
                Add and manage dynamic categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {categoryError && (
                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded flex items-center gap-1">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="New category..."
                  value={manageCategoryInput}
                  onChange={(e) => {
                    setManageCategoryInput(e.target.value);
                    setCategoryError('');
                  }}
                  className="h-9 text-xs"
                />
                <Button type="button" onClick={handleManageAddCategory} className="h-9 px-3 shrink-0">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">Dynamic Directory:</span>
                <div className="divide-y divide-border border border-border rounded-md max-h-[260px] overflow-y-auto bg-card">
                  {categories.map((cat) => {
                    const isUsed = products.some(p => p.category.toLowerCase() === cat.toLowerCase());
                    return (
                      <div key={cat} className="flex items-center justify-between px-3 py-2 text-xs">
                        <span className="font-semibold text-foreground">{cat}</span>
                        {isUsed ? (
                          <span className="text-[9px] font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            In Use
                          </span>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleManageDeleteCategory(cat)}
                            className="h-6 w-6 text-red-500 hover:bg-red-500/10 rounded-full"
                            title="Delete Category"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <Alert variant="destructive">
              <AlertTitle>Validation Alert</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">
              Product Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Sony WH-1000XM5"
              error={formErrors.name}
            />
          </div>

          {/* SKU */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">
              SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
            </label>
            <Input
              value={formSku}
              onChange={(e) => setFormSku(e.target.value)}
              placeholder="e.g. AUD-SONYXM5"
              error={formErrors.sku}
              disabled={!!editingProduct} // SKU is typically immutable once created
            />
            {!editingProduct && (
              <span className="text-[10px] text-muted-foreground">SKU must be completely unique.</span>
            )}
          </div>

          {/* Price */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">
              Price (₹) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="e.g. 30000"
              error={formErrors.price}
            />
          </div>

          <div className="grid gap-4 grid-cols-2">
            {/* Stock Quantity */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step="1"
                value={formStock}
                onChange={(e) => setFormStock(e.target.value)}
                placeholder="e.g. 20"
                error={formErrors.stock}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                <span>Category <span className="text-red-500">*</span></span>
                <button
                  type="button"
                  onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                  className="text-xs text-primary hover:underline font-semibold"
                >
                  {isAddingNewCategory ? 'Cancel' : '+ Add New'}
                </button>
              </label>
              
              {!isAddingNewCategory ? (
                <Select
                  placeholder="Choose Category..."
                  options={categories.map((cat) => ({ value: cat, label: cat }))}
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  error={formErrors.category}
                />
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name..."
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    error={formErrors.category}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAddNewCategory}
                    size="sm"
                    className="h-10 px-3"
                  >
                    Add
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Status</label>
            <Select
              placeholder=""
              options={[
                { value: 'Active', label: 'Active' },
                { value: 'Inactive', label: 'Inactive' }
              ]}
              value={formStatus}
              onChange={(e) => setFormStatus(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteConfirmProduct}
        onClose={() => setDeleteConfirmProduct(null)}
        title="Confirm Deletion"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div className="text-sm font-semibold">This action cannot be undone.</div>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete <span className="font-bold text-foreground">"{deleteConfirmProduct?.name}"</span>?
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button variant="outline" type="button" onClick={() => setDeleteConfirmProduct(null)}>
              Cancel
            </Button>
            <Button variant="destructive" type="button" onClick={handleDeleteConfirm}>
              Delete Product
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};
