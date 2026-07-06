import React, { useState } from 'react';
import { Package, Search, Plus, AlertTriangle, ArrowUpDown, ChevronRight, X, Info } from 'lucide-react';
import { InventoryItem, Settings } from '../types';

interface InventoryTabProps {
  inventory: InventoryItem[];
  settings: Settings;
  onAdjustStock: (ingredientId: string, adjustment: number) => Promise<void>;
}

export default function InventoryTab({ inventory, settings, onAdjustStock }: InventoryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Filter items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.ingredientName.toLowerCase().includes(searchTerm.toLowerCase());
    const isLowStock = item.currentStock < item.minStockLevel;
    const matchesLowStock = !showLowStockOnly || isLowStock;

    return matchesSearch && matchesLowStock;
  });

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || !adjustmentValue) return;

    setSubmitting(true);
    try {
      await onAdjustStock(selectedItem.ingredientId, Number(adjustmentValue));
      setAdjustmentValue('');
      setSelectedItem(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-transparent h-full">
      
      {/* Header action block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-600" />
            <span>Raw Ingredients & Inventory Stock</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Track daily raw items, verify cold storage points, and append incoming vendor receipts.
          </p>
        </div>

        {/* Low Stock count pill */}
        <div className="flex items-center gap-2 bg-amber-50 text-amber-600 border border-amber-100 px-4 py-2 rounded-xl font-bold text-xs shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
          <span>{inventory.filter(i => i.currentStock < i.minStockLevel).length} STOCK WARNINGS DETECTED</span>
        </div>
      </div>

      {/* Filter and searching */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center shadow-sm select-none">
        
        {/* Search */}
        <div className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search raw ingredients by name (e.g. tomatoes, onions, garlic)..."
            className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 focus:bg-white focus:border-emerald-500/40 rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
          />
        </div>

        {/* Low Stock Toggle Checkbox */}
        <button
          onClick={() => setShowLowStockOnly(!showLowStockOnly)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all duration-200 cursor-pointer ${
            showLowStockOnly
              ? 'bg-amber-50 border-amber-200 text-amber-700 shadow-sm'
              : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Show Low Stock Only</span>
        </button>
      </div>

      {/* Grid of stock meters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 select-none">
        {filteredInventory.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-gray-100 rounded-3xl font-semibold text-gray-400">
            No ingredients match your active filters.
          </div>
        ) : (
          filteredInventory.map((item) => {
            const isLow = item.currentStock < item.minStockLevel;
            const percentage = Math.min(100, Math.round((item.currentStock / item.minStockLevel) * 100));
            
            return (
              <div 
                key={item.id} 
                className={`bg-white border rounded-3xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${
                  isLow ? 'border-amber-200' : 'border-gray-100 hover:border-emerald-500/30'
                }`}
              >

                {/* Top Title and metrics */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 tracking-wide">{item.ingredientName}</h4>
                    <span className="text-[10px] text-gray-400 font-mono font-semibold block mt-1">
                      MIN TARGET: {item.minStockLevel} {item.unitOfMeasure}
                    </span>
                  </div>

                  {isLow ? (
                    <span className="flex items-center gap-1 text-[9px] text-amber-600 font-bold bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md font-mono">
                      LOW STOCK
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-mono">
                      STABLE
                    </span>
                  )}
                </div>

                {/* Big Stock Indicator */}
                <div className="flex items-baseline gap-1 pt-1 select-none">
                  <span className={`text-3xl font-bold tracking-tight ${isLow ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {item.currentStock}
                  </span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase font-mono">{item.unitOfMeasure}</span>
                </div>

                {/* Progress bar meter */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 font-mono uppercase tracking-wide">
                    <span>STOCK RATIO</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                {/* Adjust Stocks Action Trigger */}
                <button
                  onClick={() => setSelectedItem(item)}
                  className="w-full mt-2 py-2 border border-gray-100 hover:border-emerald-500/20 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-emerald-700 font-semibold text-[10px] uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer text-center"
                >
                  Adjust Stock
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Adjust Quantity Modal Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white border border-gray-200 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-4.5 h-4.5 text-emerald-600" />
                <h4 className="font-bold text-gray-800 text-sm tracking-wider">Adjust Stock Level</h4>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Content Form */}
            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4.5 text-xs text-gray-600">
              
              {/* Ingredient stats card */}
              <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl space-y-2">
                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block font-mono">Ingredient Item</span>
                <span className="text-sm font-bold text-gray-800 block uppercase tracking-wide">{selectedItem.ingredientName}</span>
                <div className="flex justify-between text-xs pt-1">
                  <span className="text-gray-500">Current Stock</span>
                  <span className="font-bold text-emerald-600 font-mono">{selectedItem.currentStock} {selectedItem.unitOfMeasure}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Warning Threshold</span>
                  <span className="font-bold text-gray-500 font-mono">{selectedItem.minStockLevel} {selectedItem.unitOfMeasure}</span>
                </div>
              </div>

              {/* Adjustment quantity input */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-400 uppercase tracking-wider block font-mono text-[9px]">Adjustment Quantity</label>
                <input
                  type="number"
                  step="any"
                  required
                  value={adjustmentValue}
                  onChange={(e) => setAdjustmentValue(e.target.value)}
                  placeholder="e.g. 15.5 to restock, -3.2 for wastage"
                  className="w-full text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:bg-white focus:border-emerald-500/40"
                />
                <p className="text-[10px] text-gray-400 leading-normal flex items-start gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Use positive values to RESTOCK, and negative values to account for wastage, consumption, or shrinkage.</span>
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
              >
                {submitting ? 'Updating...' : 'Adjust Stock'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
