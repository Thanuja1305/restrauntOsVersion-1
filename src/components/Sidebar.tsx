import React from 'react';
import { 
  Bot, 
  ShoppingBag, 
  UtensilsCrossed, 
  Package, 
  Users, 
  Truck, 
  Coins, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut,
  MapPin,
  ClipboardCheck,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { Settings } from '../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  settings: Settings;
  onLogout: () => void;
  user: any;
}

export default function Sidebar({ activeTab, setActiveTab, settings, onLogout, user }: SidebarProps) {
  const navItems = [
    { id: 'ai_agent', label: 'Command Center', icon: Bot },
    { id: 'orders', label: 'Order Ledger', icon: ShoppingBag },
    { id: 'menu', label: 'Menu Vault', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'finance', label: 'Finance', icon: Coins },
    { id: 'reports', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="w-64 bg-[#0B251A] text-gray-300 flex flex-col h-full shrink-0 select-none border-r border-emerald-950/40 relative z-20">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-emerald-950/60 flex items-center gap-3">
        <div className="bg-emerald-500 text-white p-2 rounded-xl shadow-lg shadow-emerald-500/10">
          <UtensilsCrossed className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-sans font-bold text-lg tracking-tight text-white leading-none">RestaurantOS</h1>
          <p className="text-[10px] text-emerald-400 font-mono mt-1 uppercase tracking-wider">Manage. Serve. Grow.</p>
        </div>
      </div>

      {/* User Info Quick Badge */}
      <div className="px-6 py-4 border-b border-emerald-950/30 bg-emerald-950/20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm uppercase">
            {user?.firstName?.[0] || 'O'}
          </div>
          <div className="truncate">
            <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-emerald-400 font-mono uppercase">{user?.role || 'owner'}</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium relative group cursor-pointer focus:outline-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabBg"
                  className="absolute inset-0 bg-emerald-600 rounded-xl shadow-lg shadow-emerald-700/25"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-3.5 w-full">
                <Icon className={`w-5 h-5 transition-colors duration-150 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`} />
                <span className={`transition-colors duration-150 ${isActive ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Restaurant Status Profile Card */}
      <div className="p-4 mx-3 mb-2 bg-[#051710] border border-emerald-950/60 rounded-2xl">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-white truncate">{settings.restaurantName}</span>
          <span className="flex items-center gap-1 text-[10px] font-mono bg-emerald-500/15 text-emerald-400 px-1.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Active
          </span>
        </div>
        <div className="space-y-1.5 text-[11px] text-gray-400">
          <p className="flex items-start gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
            <span>{settings.address}</span>
          </p>
          <p className="flex items-center gap-1 font-mono text-[10px]">
            <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>GSTIN: {settings.gstin}</span>
          </p>
          <p className="flex items-center gap-1 font-mono text-[10px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>FSSAI: {settings.fssai}</span>
          </p>
        </div>
      </div>

      {/* Logout Action Button */}
      <div className="p-4 border-t border-emerald-950/60">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold bg-red-950/10 hover:bg-red-950/30 text-red-400 hover:text-red-300 border border-red-950/30 hover:border-red-900/50 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout System</span>
        </button>
      </div>
    </div>
  );
}
