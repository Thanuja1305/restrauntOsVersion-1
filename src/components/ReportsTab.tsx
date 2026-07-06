import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  PieChart as PieIcon, 
  Activity, 
  ShoppingBag, 
  AlertTriangle 
} from 'lucide-react';
import { Order, MenuItem, Customer, InventoryItem, Settings } from '../types';
import { useLoadingStore } from '../store/useLoadingStore';
import { motion } from 'motion/react';

interface ReportsTabProps {
  orders: Order[];
  menu: MenuItem[];
  customers: Customer[];
  inventory: InventoryItem[];
  settings: Settings;
}

export default function ReportsTab({ orders, menu, customers, inventory, settings }: ReportsTabProps) {
  const { isGlobalLoading } = useLoadingStore();

  // Aggregate sales and volume over the last 7 days
  const dailyMetricsData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, idx) => {
      // Historical seed values
      const mockRevenues = [16200, 18500, 14200, 22100, 26400, 31200];
      const mockVolume = [24, 30, 22, 35, 41, 48];
      const isToday = idx === 6; // Sunday/Today
      
      const todayCompletedOrders = orders.filter(o => o.status === 'completed');
      const todayTotal = todayCompletedOrders.reduce((sum, o) => sum + o.total, 0);
      const todayOrdersCount = todayCompletedOrders.length;

      return {
        name: day,
        Revenue: isToday ? todayTotal : mockRevenues[idx],
        'Order Volume': isToday ? todayOrdersCount : mockVolume[idx],
      };
    });
  }, [orders]);

  // Culinary Category Sales Velocity Pie chart data
  const categorySpreadData = useMemo(() => {
    const counts: Record<string, number> = {
      'Mains': 0,
      'Starters': 0,
      'Bread': 0,
      'Beverages': 0
    };

    orders.filter(o => o.status === 'completed').forEach(ord => {
      ord.items.forEach(item => {
        const menuItem = menu.find(m => m.id === item.menuId);
        const cat = menuItem ? menuItem.category : 'Mains';
        if (counts[cat] !== undefined) {
          counts[cat] += item.quantity;
        } else {
          counts[cat] = item.quantity;
        }
      });
    });

    const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
    if (totalCount === 0) {
      counts['Mains'] = 45;
      counts['Starters'] = 22;
      counts['Bread'] = 30;
      counts['Beverages'] = 28;
    }

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [orders, menu]);

  // Inventory Health Metrics: Lowest stock levels relative to safety minimums
  const inventoryHealthData = useMemo(() => {
    if (!inventory || inventory.length === 0) {
      return [
        { name: 'Basmati Rice', 'Current Stock': 12, 'Min Stock Level': 15 },
        { name: 'Paneer', 'Current Stock': 4, 'Min Stock Level': 10 },
        { name: 'Heavy Cream', 'Current Stock': 3, 'Min Stock Level': 8 },
        { name: 'Onions', 'Current Stock': 40, 'Min Stock Level': 50 },
        { name: 'Cooking Oil', 'Current Stock': 15, 'Min Stock Level': 20 },
      ];
    }
    return [...inventory]
      .sort((a, b) => (a.currentStock / Math.max(1, a.minStockLevel)) - (b.currentStock / Math.max(1, b.minStockLevel)))
      .slice(0, 6)
      .map(item => ({
        name: item.ingredientName.length > 12 ? item.ingredientName.slice(0, 10) + '..' : item.ingredientName,
        'Current Stock': item.currentStock,
        'Min Stock Level': item.minStockLevel,
      }));
  }, [inventory]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  const totalRevenueToday = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.total, 0);

  const completedOrdersCount = orders.filter(o => o.status === 'completed').length;
  const currentAov = completedOrdersCount > 0 ? Math.round(totalRevenueToday / completedOrdersCount) : 0;

  // Render skeleton screen if API initial fetch is in progress
  if (isGlobalLoading) {
    return (
      <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-gray-50 h-full">
        {/* Header Skeleton */}
        <div className="shrink-0 space-y-2">
          <div className="h-6 bg-gray-200 rounded-lg w-1/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-lg w-1/2 animate-pulse" />
        </div>

        {/* Grid of Reports Graphs Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
          {/* Chart Skeleton 1 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-64 bg-gray-50/50 rounded-2xl flex items-end justify-between p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              {[30, 45, 35, 60, 50, 75, 40].map((h, i) => (
                <div key={i} className="bg-gray-200 rounded-lg w-[10%] animate-pulse" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Chart Skeleton 2 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-64 bg-gray-50/50 rounded-2xl flex items-end justify-between p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              {[40, 25, 55, 30, 65, 50, 80].map((h, i) => (
                <div key={i} className="bg-gray-200 rounded-lg w-[10%] animate-pulse" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>

          {/* Chart Skeleton 3 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse" />
              </div>
              <div className="w-16 h-4 bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="h-64 bg-gray-50/50 rounded-2xl flex items-end justify-around p-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              {[50, 40, 60, 35, 70].map((h, i) => (
                <div key={i} className="flex gap-1.5 items-end h-full">
                  <div className="bg-gray-200 rounded-t-md w-4 animate-pulse" style={{ height: `${h}%` }} />
                  <div className="bg-gray-350 rounded-t-md w-4 animate-pulse" style={{ height: `${h + 15}%` }} />
                </div>
              ))}
            </div>
          </div>

          {/* Chart Skeleton 4 */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-gray-200 rounded-md animate-pulse" />
                <div className="h-4 bg-gray-200 rounded-md w-36 animate-pulse" />
              </div>
            </div>
            <div className="h-64 bg-gray-50/50 rounded-2xl flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
              <div className="w-32 h-32 rounded-full border-8 border-gray-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Aggregates Skeleton */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
          <div className="h-4 bg-gray-200 rounded w-48 mb-4 animate-pulse" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3 animate-pulse" />
                <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 flex-1 overflow-y-auto select-none bg-gray-50 h-full">
      
      {/* Header */}
      <div className="shrink-0">
        <h3 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <span>Operational Business Intelligence Reports</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Review dynamic revenue metrics, monitor category dining velocities, and audit VIP loyalty.
        </p>
      </div>

      {/* Grid of Reports Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
        
        {/* Chart 1: Revenue Line/Area gradient chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">Weekly Cashflow Inflows</h4>
            </div>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
              Live updates
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyMetricsData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 11 }}
                  formatter={(value) => [`${settings.currency}${value.toLocaleString()}`, 'Revenue']}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'medium' }} />
                <Area type="monotone" dataKey="Revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Daily Order Volume Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.05 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">Daily Order Volume Velocity</h4>
            </div>
            <span className="text-[10px] text-teal-600 font-bold bg-teal-50 px-2 py-0.5 rounded-full font-mono">
              Completed sales
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyMetricsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 11 }}
                  formatter={(value) => [`${value} Orders`, 'Order Volume']}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'medium' }} />
                <Bar dataKey="Order Volume" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 3: Inventory Health Metrics Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.1 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">Inventory Stock Level Audit</h4>
            </div>
            <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Safety Monitor
            </span>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ background: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 11 }}
                />
                <Legend wrapperStyle={{ fontSize: 11, fontWeight: 'medium' }} />
                <Bar dataKey="Current Stock" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Min Stock Level" fill="#EF4444" radius={[4, 4, 0, 0]} opacity={0.6} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 4: Category spread Pie chart */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.15 }}
          className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4"
        >
          <div className="flex justify-between items-center pb-2 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4.5 h-4.5 text-emerald-600" />
              <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">Culinary Velocity Share</h4>
            </div>
          </div>
          
          <div className="h-64 flex flex-col sm:flex-row items-center justify-center gap-2">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorySpreadData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categorySpreadData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: '#ffffff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend */}
            <div className="space-y-2 text-xs shrink-0 select-none">
              {categorySpreadData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-md" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-semibold text-gray-700">{item.name}</span>
                  <span className="font-mono text-gray-400">({item.value} sold)</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Dynamic Aggregations Cards */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20, delay: 0.2 }}
        className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between gap-4 select-none"
      >
        <div className="pb-2 border-b border-gray-50">
          <h4 className="font-bold text-xs text-gray-800 uppercase tracking-wider font-mono">Today's Quick Aggregates</h4>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card A */}
          <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Net Revenue</span>
            <span className="text-base font-black text-emerald-700 font-mono mt-1 block">
              {settings.currency}{totalRevenueToday.toLocaleString()}
            </span>
          </div>

          {/* Card B */}
          <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">AOV size</span>
            <span className="text-base font-black text-gray-800 font-mono mt-1 block">
              {settings.currency}{currentAov}
            </span>
          </div>

          {/* Card C */}
          <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">Completed Checkout</span>
            <span className="text-base font-black text-gray-800 font-mono mt-1 block">
              {completedOrdersCount} orders
            </span>
          </div>

          {/* Card D */}
          <div className="bg-gray-50 border border-gray-100 p-4.5 rounded-2xl">
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider block">VIP Members</span>
            <span className="text-base font-black text-emerald-700 font-mono mt-1 block">
              {customers.length} members
            </span>
          </div>
        </div>

        {/* Prompt banner footer */}
        <div className="bg-emerald-50 border border-emerald-100/50 p-4.5 rounded-2xl text-[11px] leading-relaxed text-emerald-800 font-medium">
          💡 <strong>SaaS Hint:</strong> Type "Show today's sales summary" inside the AI Agent chat panel at any time to instantly populate beautiful metrics cards for your stakeholders!
        </div>
      </motion.div>

    </div>
  );
}
