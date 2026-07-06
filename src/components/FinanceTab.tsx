import React, { useState } from 'react';
import { 
  Coins, 
  Search, 
  Plus, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Info
} from 'lucide-react';
import { Payment, Expense, Bill, Supplier, Settings } from '../types';

interface FinanceTabProps {
  payments: Payment[];
  expenses: Expense[];
  bills: Bill[];
  suppliers: Supplier[];
  settings: Settings;
  onAddExpense: (category: string, amount: number, description?: string) => Promise<void>;
  onAddBill: (supplierId: string, amount: number, dueDate: string) => Promise<void>;
  onSettleBill: (billId: string, status: 'paid' | 'unpaid') => Promise<void>;
}

export default function FinanceTab({
  payments,
  expenses,
  bills,
  suppliers,
  settings,
  onAddExpense,
  onAddBill,
  onSettleBill
}: FinanceTabProps) {
  const [activeLedger, setActiveLedger] = useState<'payments' | 'expenses' | 'bills'>('payments');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBillModal, setShowBillModal] = useState(false);

  // Form states
  const [expCategory, setExpCategory] = useState('inventory');
  const [expAmount, setExpAmount] = useState('');
  const [expDesc, setExpDesc] = useState('');
  
  const [billSupplierId, setBillSupplierId] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Computed Totals
  const totalInflow = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalOutflow = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalOutstanding = bills.filter(b => b.status === 'unpaid').reduce((sum, b) => sum + b.amount, 0);

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCategory || !expAmount) return;

    setSubmitting(true);
    try {
      await onAddExpense(expCategory, Number(expAmount), expDesc);
      setExpCategory('inventory');
      setExpAmount('');
      setExpDesc('');
      setShowExpenseModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!billSupplierId || !billAmount || !billDueDate) return;

    setSubmitting(true);
    try {
      await onAddBill(billSupplierId, Number(billAmount), billDueDate);
      setBillSupplierId('');
      setBillAmount('');
      setBillDueDate('');
      setShowBillModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-gray-50 h-full">
      
      {/* Header action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-600" />
            <span>Operational Finance Ledger</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Monitor incoming cash register flows, verify logged utility expenses, and pay outstanding vendor invoices.
          </p>
        </div>

        {/* Buttons container */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 hover:border-red-300 bg-red-50 hover:bg-red-100 text-red-800 font-bold text-xs transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-red-600" />
            <span>Log Business Cost</span>
          </button>
          
          <button
            onClick={() => setShowBillModal(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-emerald-300 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 font-bold text-xs transition-all duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Record Vendor Bill</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none shrink-0">
        
        {/* Total Inflows */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600 shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Inflow (Payments)</span>
            <span className="text-xl font-black text-gray-800 font-sans mt-0.5 block">{settings.currency}{totalInflow.toLocaleString()}</span>
          </div>
        </div>

        {/* Total Outflows */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-red-50 text-red-600 shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Outflow (Expenses)</span>
            <span className="text-xl font-black text-gray-800 font-sans mt-0.5 block">{settings.currency}{totalOutflow.toLocaleString()}</span>
          </div>
        </div>

        {/* Outstanding Liabilities */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 relative overflow-hidden">
          <div className="p-4 rounded-2xl bg-amber-50 text-amber-600 shrink-0">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Accounts Payable</span>
            <span className="text-xl font-black text-amber-700 font-sans mt-0.5 block">{settings.currency}{totalOutstanding.toLocaleString()}</span>
          </div>
        </div>

      </div>

      {/* Ledger Selector Navigation tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex gap-2 items-center shadow-sm select-none shrink-0">
        {[
          { id: 'payments', label: 'Payments Inflow ledger' },
          { id: 'expenses', label: 'Utility Expenses Outflow' },
          { id: 'bills', label: 'Supplier Bills Payable' }
        ].map((led) => (
          <button
            key={led.id}
            onClick={() => setActiveLedger(led.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
              activeLedger === led.id
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {led.label}
          </button>
        ))}
      </div>

      {/* Selected Ledger Database table */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm select-none">
        
        {/* Ledger: PAYMENTS TABLE */}
        {activeLedger === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                  <th className="py-4.5 px-6">Transaction ID</th>
                  <th className="py-4.5 px-6">POS Order ID</th>
                  <th className="py-4.5 px-6">Inflow Amount</th>
                  <th className="py-4.5 px-6">Payment Method</th>
                  <th className="py-4.5 px-6">Settlement Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 font-medium text-gray-400">
                      No customer transactions logged.
                    </td>
                  </tr>
                ) : (
                  payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-gray-500">{pay.id}</td>
                      <td className="py-4 px-6 font-mono font-bold text-gray-800">{pay.orderId}</td>
                      <td className="py-4 px-6 font-mono font-bold text-emerald-700">+{settings.currency}{pay.amount.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">
                          {pay.paymentMethod}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-400">
                        {new Date(pay.createdAt).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger: EXPENSES TABLE */}
        {activeLedger === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                  <th className="py-4.5 px-6">Expense ID</th>
                  <th className="py-4.5 px-6">Cost Category</th>
                  <th className="py-4.5 px-6">Outflow Amount</th>
                  <th className="py-4.5 px-6">Memo Description</th>
                  <th className="py-4.5 px-6">Filing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {expenses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 font-medium text-gray-400">
                      No commercial cost sheets logged.
                    </td>
                  </tr>
                ) : (
                  expenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-gray-500">{exp.id}</td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-red-600 bg-red-50 border border-red-100">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-red-600">-{settings.currency}{exp.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 text-gray-500 font-medium">{exp.description || 'N/A'}</td>
                      <td className="py-4 px-6 font-mono text-gray-400">
                        {new Date(exp.expenseDate).toLocaleDateString('en-US')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Ledger: SUPPLIER BILLS TABLE */}
        {activeLedger === 'bills' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-[10px] text-gray-400 font-bold uppercase tracking-wider font-mono">
                  <th className="py-4.5 px-6">Bill Invoice ID</th>
                  <th className="py-4.5 px-6">Partner Supplier</th>
                  <th className="py-4.5 px-6">Owed Amount</th>
                  <th className="py-4.5 px-6">Settlement Deadline</th>
                  <th className="py-4.5 px-6">Clearing Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-600">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 font-medium text-gray-400">
                      No logistics bills archived.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-gray-500">{bill.id}</td>
                      <td className="py-4 px-6 font-semibold text-gray-800">{bill.supplierName}</td>
                      <td className="py-4 px-6 font-mono font-bold text-gray-900">{settings.currency}{bill.amount.toLocaleString()}</td>
                      <td className="py-4 px-6 font-mono text-gray-400">{new Date(bill.dueDate).toLocaleDateString('en-US')}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {bill.status === 'paid' ? (
                            <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100">Paid Invoice</span>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="px-2.5 py-1 rounded-full text-[9px] uppercase font-mono font-bold text-red-600 bg-red-50 border border-red-100">Unpaid</span>
                              <button 
                                onClick={() => onSettleBill(bill.id, 'paid')} 
                                className="text-[10px] font-bold text-emerald-600 hover:underline cursor-pointer"
                              >
                                Clear Invoice
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Log Expense Overlay Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-gray-800 text-sm">Filing Business Outflow</h4>
              </div>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleExpenseSubmit} className="p-6 space-y-4.5 text-xs text-gray-700">
              
              {/* Category */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Outflow Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-emerald-500"
                >
                  <option value="inventory">Kitchen Inventory Procurement</option>
                  <option value="utilities">Utilities (Power, Web, Water)</option>
                  <option value="rent">Commercial Estate Rent</option>
                  <option value="salaries">Staff Wages / Rewards</option>
                  <option value="marketing">Brand Marketing / Promo</option>
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Filing Amount ({settings.currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="e.g. 4500"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Outflow Description (Memo)</label>
                <input
                  type="text"
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Cleared monthly electricity invoice"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-extrabold text-xs shadow-md shadow-red-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
              >
                {submitting ? 'Registering cost...' : 'Commit Cost Sheet'}
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Record Vendor Bill Overlay Modal */}
      {showBillModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col border border-gray-100 animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-gray-800 text-sm">Archiving Vendor Bill</h4>
              </div>
              <button
                onClick={() => setShowBillModal(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBillSubmit} className="p-6 space-y-4.5 text-xs text-gray-700">
              
              {/* Supplier */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Partner Vendor Supplier</label>
                <select
                  value={billSupplierId}
                  onChange={(e) => setBillSupplierId(e.target.value)}
                  required
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 bg-white outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose logistics partner --</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Owed Amount ({settings.currency})</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={billAmount}
                  onChange={(e) => setBillAmount(e.target.value)}
                  placeholder="e.g. 8400"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Due date */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Invoice Due Date</label>
                <input
                  type="date"
                  required
                  value={billDueDate}
                  onChange={(e) => setBillDueDate(e.target.value)}
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
              >
                {submitting ? 'Logging invoice...' : 'Archive Vendor invoice liability'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
