import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Plus, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle, 
  ChevronRight, 
  TrendingUp, 
  User, 
  Settings as SettingsIcon,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order, MenuItem, Customer, Settings } from '../types';

interface OrdersTabProps {
  orders: Order[];
  menu: MenuItem[];
  customers: Customer[];
  settings: Settings;
  onCreateOrder: (customerId: string | undefined, items: { menuId: string; quantity: number; notes?: string }[], discount?: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export default function OrdersTab({
  orders,
  menu,
  customers,
  settings,
  onCreateOrder,
  onUpdateOrderStatus,
  isCreateModalOpen,
  setIsCreateModalOpen
}: OrdersTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Order Form state
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState<{ menuId: string; quantity: number; notes: string }[]>([
    { menuId: '', quantity: 1, notes: '' }
  ]);
  const [discountValue, setDiscountValue] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Filter orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.customerName && o.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      o.serverName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleAddItem = () => {
    setOrderItems([...orderItems, { menuId: '', quantity: 1, notes: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    const next = [...orderItems];
    next.splice(index, 1);
    setOrderItems(next);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const next = [...orderItems];
    next[index] = { ...next[index], [field]: value };
    setOrderItems(next);
  };

  const computeNewOrderTotals = () => {
    let subtotal = 0;
    orderItems.forEach(item => {
      const dish = menu.find(m => m.id === item.menuId);
      if (dish) {
        subtotal += dish.price * item.quantity;
      }
    });

    const tax = Math.round((subtotal - discountValue) * (settings.taxRate / 100) * 100) / 100;
    const total = Math.max(0, subtotal - discountValue + tax);

    return { subtotal, tax, total };
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = orderItems.filter(item => item.menuId);
    if (!validItems.length) {
      alert('Please select at least one menu item.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreateOrder(
        selectedCustomerId || undefined,
        validItems,
        discountValue
      );
      // Reset State
      setSelectedCustomerId('');
      setOrderItems([{ menuId: '', quantity: 1, notes: '' }]);
      setDiscountValue(0);
      setIsCreateModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const { subtotal, tax, total } = computeNewOrderTotals();

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-gray-50 h-full">
      
      {/* Top action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>Order Management Registry</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Browse active POS sales, update kitchen preparation pipelines, and log walk-in billing.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/10 cursor-pointer shrink-0 focus:outline-none"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>New Order POS</span>
        </motion.button>
      </div>

      {/* Filter panel */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm select-none">
        
        {/* Search block */}
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search orders by ID, guest name, or placing server..."
            className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full md:w-auto">
          {['all', 'pending', 'preparing', 'completed', 'cancelled'].map((status) => {
            const isActive = statusFilter === status;
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer focus:outline-none ${
                  isActive ? 'text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeStatusFilter"
                    className="absolute inset-0 bg-emerald-600 rounded-xl"
                    transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                  />
                )}
                <span className="relative z-10">{status}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table Database */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm select-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                <th className="py-4.5 px-6">Order ID</th>
                <th className="py-4.5 px-6">Customer / Guest</th>
                <th className="py-4.5 px-6">Assigned Server</th>
                <th className="py-4.5 px-6">Items Summary</th>
                <th className="py-4.5 px-6">Total Cost</th>
                <th className="py-4.5 px-6">Placed Date</th>
                <th className="py-4.5 px-6 text-center">Preparation Pipeline</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
              <AnimatePresence mode="popLayout">
                {filteredOrders.length === 0 ? (
                  <motion.tr
                    key="empty-state"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td colSpan={7} className="text-center py-10 font-medium text-gray-400">
                      No order receipts found matching the filters.
                    </td>
                  </motion.tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <motion.tr
                      key={ord.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{
                        opacity: { duration: 0.2 },
                        y: { type: 'spring', stiffness: 350, damping: 25 },
                        x: { duration: 0.2 },
                        layout: { type: 'spring', stiffness: 350, damping: 25 }
                      }}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-gray-800">{ord.id}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{ord.customerName}</td>
                      <td className="py-4 px-6 text-gray-500 font-medium">{ord.serverName}</td>
                      <td className="py-4 px-6 max-w-xs truncate text-gray-500" title={ord.items.map(i => `${i.menuName} x${i.quantity}`).join(', ')}>
                        {ord.items.map(i => `${i.menuName} (x${i.quantity})`).join(', ')}
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-gray-900">{settings.currency}{ord.total.toLocaleString()}</td>
                      <td className="py-4 px-6 font-mono text-gray-400">
                        {new Date(ord.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-1.5">
                          {ord.status === 'pending' && (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-amber-600 bg-amber-50 border border-amber-100">Pending</span>
                              <button onClick={() => onUpdateOrderStatus(ord.id, 'preparing')} className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer">Accept</button>
                            </div>
                          )}
                          {ord.status === 'preparing' && (
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100">Preparing</span>
                              <button onClick={() => onUpdateOrderStatus(ord.id, 'completed')} className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer">Complete</button>
                            </div>
                          )}
                          {ord.status === 'completed' && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">Completed</span>
                          )}
                          {ord.status === 'cancelled' && (
                            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-red-600 bg-red-50 border border-red-100">Cancelled</span>
                          )}
                          {ord.status !== 'completed' && ord.status !== 'cancelled' && (
                            <>
                              <span className="text-gray-300">|</span>
                              <button onClick={() => onUpdateOrderStatus(ord.id, 'cancelled')} className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* POS New Order Overlay Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 select-none"
          >
            <motion.div 
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 280, damping: 24 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-gray-100"
            >
              
              {/* Modal Header */}
              <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-gray-800 text-sm">New Checkout Register POS</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl transition-all cursor-pointer focus:outline-none"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Modal Scrollable Form */}
              <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-gray-700">
                
                {/* Customer Selector */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Link Loyalty Guest Account (Optional)</label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="">-- Non-Member Walk-in Guest --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone}) - {c.loyaltyPoints} pts</option>
                    ))}
                  </select>
                </div>

                {/* Items Selector */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-gray-50">
                    <label className="font-bold text-gray-600 uppercase tracking-wider">Select Menu Recipes</label>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="text-[10px] font-extrabold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer hover:underline focus:outline-none"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Another Dish</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {orderItems.map((item, index) => (
                      <div key={index} className="flex gap-2.5 items-end">
                        {/* Dish dropdown */}
                        <div className="flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 font-mono">Dish {index + 1}</span>
                          <select
                            value={item.menuId}
                            onChange={(e) => handleItemChange(index, 'menuId', e.target.value)}
                            className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 bg-white outline-none focus:border-emerald-500"
                            required
                          >
                            <option value="">-- Choose Menu Item --</option>
                            {menu.map(m => (
                              <option key={m.id} value={m.id} disabled={!m.isAvailable}>{m.name} ({settings.currency}{m.price}) {!m.isAvailable ? '[SOLD OUT]' : ''}</option>
                            ))}
                          </select>
                        </div>

                        {/* Quantity input */}
                        <div className="w-20 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 font-mono">Qty</span>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                            required
                          />
                        </div>

                        {/* Notes input */}
                        <div className="flex-1 space-y-1">
                          <span className="text-[10px] font-bold text-gray-400 font-mono">Custom Notes (Optional)</span>
                          <input
                            type="text"
                            placeholder="No spicy, extra lemon, etc."
                            value={item.notes}
                            onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                            className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Remove button */}
                        {orderItems.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl cursor-pointer focus:outline-none"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount selection */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Apply Discount Amount ({settings.currency})</label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Totals Box Display */}
                <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl space-y-2 select-none">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-mono text-gray-800">{settings.currency}{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Discount Applied</span>
                    <span className="font-mono text-red-600">-{settings.currency}{discountValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-500">Sales Tax ({settings.taxRate}%)</span>
                    <span className="font-mono text-gray-800">{settings.currency}{tax.toLocaleString()}</span>
                  </div>
                  <div className="h-[1px] bg-gray-200 my-1" />
                  <div className="flex justify-between text-sm font-extrabold">
                    <span className="text-gray-800">Final Order Total</span>
                    <span className="font-mono text-emerald-700 text-base">{settings.currency}{total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Submission Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center focus:outline-none"
                >
                  {submitting ? 'Registering checkout...' : 'Submit POS Checkout Order'}
                </button>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
