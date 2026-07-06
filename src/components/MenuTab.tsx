import React, { useState } from 'react';
import { UtensilsCrossed, Search, Plus, X, Tag, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import { MenuItem, Settings } from '../types';

interface MenuTabProps {
  menu: MenuItem[];
  settings: Settings;
  onAddMenuItem: (item: Omit<MenuItem, 'id' | 'createdAt'>) => Promise<void>;
  onToggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
}

export default function MenuTab({ menu, settings, onAddMenuItem, onToggleAvailability }: MenuTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Mains');
  const [isAvailable, setIsAvailable] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Categories extracted dynamically + 'all'
  const categories = ['all', ...Array.from(new Set(menu.map(m => m.category)))];

  const filteredMenu = menu.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;

    return matchesSearch && matchesCategory;
  });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) return;

    setSubmitting(true);
    try {
      await onAddMenuItem({
        name,
        description,
        price: Number(price),
        category,
        isAvailable
      });
      // Clear
      setName('');
      setDescription('');
      setPrice('');
      setCategory('Mains');
      setIsAvailable(true);
      setIsOpen(false);
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
            <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
            <span>Digital Recipe Menu Hub</span>
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Update pricing configurations, edit recipe catalogs, and manage real-time ingredients availability.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer shrink-0"
        >
          <Plus className="w-4.5 h-4.5" />
          <span>Add New Dish</span>
        </button>
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
            placeholder="Search kitchen delicacies by name or ingredient description..."
            className="w-full text-xs font-semibold text-gray-700 bg-gray-50 border border-gray-100 focus:border-emerald-500 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all duration-200"
          />
        </div>

        {/* Dynamic Category Selector list */}
        <div className="flex flex-wrap items-center gap-1.5 shrink-0 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Dishes Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
        {filteredMenu.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white border border-gray-100 rounded-3xl font-medium text-gray-400">
            No recipes matching current filters.
          </div>
        ) : (
          filteredMenu.map((dish) => (
            <div 
              key={dish.id} 
              className={`bg-white border rounded-3xl p-5.5 flex flex-col justify-between gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
                dish.isAvailable ? 'border-gray-100' : 'border-gray-200 bg-gray-100/50'
              }`}
            >
              {/* Category tag */}
              <div className="flex justify-between items-start gap-2">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 font-mono border border-emerald-100">
                  {dish.category}
                </span>

                {/* Available toggle indicator */}
                <button
                  onClick={() => onToggleAvailability(dish.id, !dish.isAvailable)}
                  className="text-gray-400 hover:text-gray-600 cursor-pointer"
                  title={dish.isAvailable ? "Mark as sold out" : "Mark as available"}
                >
                  {dish.isAvailable ? (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                      Available
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                      Sold Out
                    </span>
                  )}
                </button>
              </div>

              {/* Title & Info */}
              <div className="space-y-1">
                <h4 className={`font-bold text-sm text-gray-800 ${!dish.isAvailable ? 'line-through text-gray-400' : ''}`}>
                  {dish.name}
                </h4>
                <p className="text-xs text-gray-400 leading-normal line-clamp-2" title={dish.description}>
                  {dish.description || 'No recipe details specified.'}
                </p>
              </div>

              {/* Price & availability controls */}
              <div className="flex justify-between items-center pt-2 border-t border-gray-50 mt-1 select-none shrink-0">
                <span className="text-sm font-extrabold text-emerald-700 font-mono">
                  {settings.currency}{dish.price}
                </span>

                {/* Action button to switch availability */}
                <button
                  onClick={() => onToggleAvailability(dish.id, !dish.isAvailable)}
                  className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {dish.isAvailable ? (
                    <ToggleRight className="w-6.5 h-6.5 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-6.5 h-6.5 text-gray-300" />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add New Dish Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in select-none">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100 animate-scale-up">
            
            {/* Header */}
            <div className="px-6 py-4.5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50">
              <div className="flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-gray-800 text-sm">Add New Gourmet Recipe</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-150 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Scrollable Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4.5 text-xs text-gray-700">
              {/* Dish Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Delicacy Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Garlic Paneer Masala"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                />
              </div>

              {/* Recipe Description */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Description / Notes</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe culinary preparation, allergens, and spice tags..."
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2 outline-none focus:border-emerald-500 h-20 resize-none"
                />
              </div>

              {/* Grid: Category & Price */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-3 py-2.5 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="Starters">Starters</option>
                    <option value="Mains">Mains</option>
                    <option value="Bread">Bread</option>
                    <option value="Beverages">Beverages</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Price ({settings.currency})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="250"
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 rounded-xl px-4 py-2.5 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Instant status check */}
              <div className="flex items-center gap-3 py-1">
                <input
                  type="checkbox"
                  id="modalIsAvailable"
                  checked={isAvailable}
                  onChange={(e) => setIsAvailable(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                />
                <label htmlFor="modalIsAvailable" className="font-bold text-gray-600 select-none cursor-pointer">
                  Instantly Available on POS Menu
                </label>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer text-center"
              >
                {submitting ? 'Adding Dish...' : 'Append gourmet recipe'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
