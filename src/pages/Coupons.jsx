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
import { Ticket, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';

export const Coupons = () => {
  const { coupons, addCoupon, deleteCoupon, toggleCouponStatus, categories } = useApp();

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [type, setType] = useState('Percentage');
  const [value, setValue] = useState('');
  const [minCartValue, setMinCartValue] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [status, setStatus] = useState('Active');
  
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Reset form helper
  const resetForm = useCallback(() => {
    setCode('');
    setType('Percentage');
    setValue('');
    setMinCartValue('');
    setTargetCategory('');
    setExpiryDate('');
    setStatus('Active');
    setFormErrors({});
    setGeneralError('');
  }, []);

  const handleOpenAdd = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errors = {};

    // Code validation
    if (!code.trim()) {
      errors.code = 'Coupon Code is mandatory.';
    } else if (code.trim().length < 3) {
      errors.code = 'Coupon Code must be at least 3 characters.';
    } else if (coupons.some((c) => c.code === code.trim().toUpperCase())) {
      errors.code = 'This Coupon Code already exists.';
    }

    // Expiry date validation
    if (!expiryDate) {
      errors.expiryDate = 'Expiry Date is mandatory.';
    }

    // Type-specific validation
    if (type === 'Percentage') {
      const val = Number(value);
      if (value === '') {
        errors.value = 'Percentage value is mandatory.';
      } else if (isNaN(val) || val <= 0 || val > 100) {
        errors.value = 'Percentage must be between 1 and 100.';
      }
    } else if (type === 'Flat') {
      const val = Number(value);
      if (value === '') {
        errors.value = 'Flat discount value is mandatory.';
      } else if (isNaN(val) || val <= 0) {
        errors.value = 'Discount value must be a positive number.';
      }
    } else if (type === 'Buy2Get1') {
      if (!targetCategory) {
        errors.targetCategory = 'Please specify a target category.';
      }
    }

    // Minimum Cart Value validation
    if (minCartValue !== '') {
      const minVal = Number(minCartValue);
      if (isNaN(minVal) || minVal < 0) {
        errors.minCartValue = 'Minimum Cart Value cannot be negative.';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Generate automatic description
    let description = '';
    if (type === 'Percentage') {
      description = `${value}% off${minCartValue ? ` on min value of ₹${Number(minCartValue).toLocaleString('en-IN')}` : ' on all orders'}`;
    } else if (type === 'Flat') {
      description = `₹${value} off${minCartValue ? ` on min value of ₹${Number(minCartValue).toLocaleString('en-IN')}` : ' on all orders'}`;
    } else if (type === 'Buy2Get1') {
      description = `Buy 2 Get 1 Free on ${targetCategory} category`;
    }

    try {
      addCoupon({
        code: code.trim().toUpperCase(),
        type,
        value: type === 'Buy2Get1' ? 0 : Number(value),
        minCartValue: minCartValue !== '' ? Number(minCartValue) : 0,
        targetCategory: type === 'Buy2Get1' ? targetCategory : '',
        expiryDate,
        status,
        description
      });
      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      setGeneralError(err.message || 'Could not save the coupon.');
    }
  };

  const handleToggle = (couponCode) => {
    toggleCouponStatus(couponCode);
  };

  const handleDelete = (couponCode) => {
    if (window.confirm(`Are you sure you want to delete coupon "${couponCode}"?`)) {
      deleteCoupon(couponCode);
    }
  };

  // Check if a date string is expired
  const isExpired = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exp = new Date(dateStr);
    exp.setHours(0, 0, 0, 0);
    return exp < today;
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 animate-fade-in">
      {/* Title section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Coupon & Promotion Management
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure dynamic checkout coupons and buy-one-get-one rules.
          </p>
        </div>
        <Button onClick={handleOpenAdd} className="w-full sm:w-auto flex items-center justify-center gap-2">
          <Plus className="h-4 w-4" />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Rules Notice */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Dynamic Coupons Listing</CardTitle>
            <CardDescription>
              Showing {coupons.length} coupons configured for the store.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 sm:pt-0">
            {coupons.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-center">Expiry</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coupons.map((coupon) => {
                    const expired = isExpired(coupon.expiryDate);
                    return (
                      <TableRow key={coupon.code} className={expired ? 'opacity-65' : ''}>
                        <TableCell>
                          <div className="flex items-center gap-1.5">
                            <Ticket className="h-4 w-4 text-violet-500 shrink-0" />
                            <code className="text-sm font-bold bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">{coupon.code}</code>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-semibold text-muted-foreground">{coupon.type}</span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-foreground">{coupon.description}</div>
                          {coupon.minCartValue > 0 && (
                            <span className="text-[10px] text-muted-foreground block">Min Cart Value: ₹{coupon.minCartValue.toLocaleString('en-IN')}</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1 text-xs">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{new Date(coupon.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          {expired && (
                            <span className="text-[10px] text-red-500 block font-semibold">Expired!</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggle(coupon.code)}
                            className={`text-xs px-2.5 py-1 h-7 rounded-md font-semibold ${
                              coupon.status === 'Active' && !expired
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                            }`}
                            disabled={expired}
                          >
                            {expired ? 'Expired' : coupon.status}
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(coupon.code)}
                            title="Delete Coupon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center text-sm text-muted-foreground py-16">
                No coupons currently registered. Click Create Coupon to add one.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info panel */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Engine Validation Rules</CardTitle>
            <CardDescription>
              Coupons are validated automatically at checkout based on these system invariants.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-muted-foreground">
            <div className="space-y-1">
              <span className="font-bold text-foreground block">1. Exclusivity</span>
              <p>Only one coupon code can be applied to a cart at any given point in time.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block">2. Automatic Expiry Checks</span>
              <p>Expired coupons are automatically rejected based on the system calendar time.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block">3. Minimum Cart Value</span>
              <p>Discounts are only applied once the cart subtotal meets the specified threshold.</p>
            </div>
            <div className="space-y-1">
              <span className="font-bold text-foreground block">4. Buy 2 Get 1 (Cheapest Unit Free)</span>
              <p>For custom categories, adding 3 or more items of the category yields the cheapest units for free.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CREATE COUPON DIALOG */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Create Store Coupon"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {generalError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Alert</AlertTitle>
              <AlertDescription>{generalError}</AlertDescription>
            </Alert>
          )}

          {/* Coupon Code */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Coupon Code *</label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. SUMMER20"
              error={formErrors.code}
              required
            />
          </div>

          {/* Coupon Type */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Coupon Type *</label>
            <Select
              placeholder=""
              options={[
                { value: 'Percentage', label: 'Percentage (%) Discount' },
                { value: 'Flat', label: 'Flat (₹) Cash Discount' },
                { value: 'Buy2Get1', label: 'Buy 2 Get 1 Free (Category Specific)' }
              ]}
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          {/* Discount Value */}
          {type !== 'Buy2Get1' ? (
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">
                {type === 'Percentage' ? 'Discount Percentage (%) *' : 'Flat Discount Amount (₹) *'}
              </label>
              <Input
                type="number"
                min="1"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={type === 'Percentage' ? 'e.g. 15' : 'e.g. 250'}
                error={formErrors.value}
                required
              />
            </div>
          ) : (
            /* Target Category selection for BUY2GET1 */
            <div className="space-y-1">
              <label className="text-sm font-semibold text-foreground">Target Category *</label>
              <Select
                placeholder="Select Category..."
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
                error={formErrors.targetCategory}
              />
              <span className="text-[10px] text-muted-foreground">Buy 2 Get 1 is applied dynamically to items of this category.</span>
            </div>
          )}

          {/* Minimum Cart Value */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Minimum Cart Value (₹)</label>
            <Input
              type="number"
              min="0"
              value={minCartValue}
              onChange={(e) => setMinCartValue(e.target.value)}
              placeholder="e.g. 3000 (Optional)"
              error={formErrors.minCartValue}
            />
          </div>

          {/* Expiry Date */}
          <div className="space-y-1">
            <label className="text-sm font-semibold text-foreground">Expiry Date *</label>
            <Input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              error={formErrors.expiryDate}
              required
            />
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
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
            <Button variant="outline" type="button" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Coupon
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
};
