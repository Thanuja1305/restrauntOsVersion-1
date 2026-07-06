import React, { useState } from 'react';
import { Calendar, Bell, Shield, AlertTriangle, HelpCircle, CheckCircle, TrendingUp, Landmark, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Notification } from '../types';

interface HeaderProps {
  settings: Settings;
  user: any;
  lowStockItemsCount: number;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationClick: (id: string) => void;
}

const getNotificationMeta = (type: string) => {
  switch (type) {
    case 'inventory_low_stock':
      return { icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border border-amber-100' };
    case 'sales_report':
      return { icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border border-emerald-100' };
    case 'finance_alert':
      return { icon: Landmark, color: 'text-red-600 bg-red-50 border border-red-100' };
    case 'support_ticket':
      return { icon: ShieldCheck, color: 'text-blue-600 bg-blue-50 border border-blue-100' };
    case 'analytics_insight':
      return { icon: CheckCircle, color: 'text-purple-600 bg-purple-50 border border-purple-100' };
    default:
      return { icon: HelpCircle, color: 'text-gray-500 bg-gray-50 border border-gray-100' };
  }
};

const formatTime = (isoString: string) => {
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

export default function Header({ 
  settings, 
  user, 
  lowStockItemsCount, 
  notifications = [], 
  onMarkAllRead, 
  onNotificationClick 
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => n.status === 'unread').length;

  const currentDateStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <header className="bg-white border-b border-gray-100 px-8 py-5 flex items-center justify-between shrink-0 select-none relative">
      {/* Greetings block */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <span>👋 Hello, {settings.restaurantName}!</span>
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Ask your Restaurant Agent anything. It will manage everything for you.
        </p>
      </div>

      {/* Control widgets panel */}
      <div className="flex items-center gap-4">
        {/* Date Selector Display */}
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-xs font-semibold text-gray-700 shadow-sm">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>{currentDateStr}</span>
        </div>

        {/* Notifications Icon with Indicator */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-600 hover:text-gray-900 transition-all duration-200 relative cursor-pointer focus:outline-none"
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[9px] text-white font-bold flex items-center justify-center rounded-full border border-white">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="absolute right-0 mt-3 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-2">
                  <span className="text-xs font-bold text-gray-800">Operational Alerts</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={() => onMarkAllRead()}
                      className="text-[10px] text-emerald-600 hover:underline cursor-pointer border-none bg-transparent outline-none p-0 font-bold"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-gray-400 text-xs font-semibold">No alerts available.</p>
                  ) : (
                    notifications.map((notif) => {
                      const { icon: NotifIcon, color } = getNotificationMeta(notif.type);
                      const isUnread = notif.status === 'unread';
                      return (
                        <div 
                          key={notif.notification_id} 
                          onClick={() => {
                            onNotificationClick(notif.notification_id);
                            setShowNotifications(false);
                          }}
                          className={`flex gap-3 hover:bg-gray-50/50 p-2 rounded-xl transition-colors duration-150 cursor-pointer relative items-start ${
                            isUnread ? 'bg-emerald-50/10' : ''
                          }`}
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${color}`}>
                            <NotifIcon className="w-4 h-4" />
                          </div>
                          <div className="text-xs flex-1 min-w-0">
                            <p className={`text-gray-700 leading-normal ${isUnread ? 'font-bold' : 'font-medium'}`}>{notif.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block font-mono">{formatTime(notif.created_at)}</span>
                          </div>
                          {isUnread && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 self-center shrink-0" />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Vertical divider */}
        <div className="h-6 w-[1px] bg-gray-100" />

        {/* Profile Profile Card */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <h4 className="text-xs font-bold text-gray-900 leading-none">{settings?.restaurantName || 'Spice Heaven'}</h4>
            <span className="text-[10px] text-emerald-600 font-mono mt-1 block uppercase font-bold tracking-wider">{user?.role || 'Owner'}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-bold flex items-center justify-center uppercase shadow-md shadow-emerald-600/10 border border-emerald-500/10">
            {settings?.restaurantName?.[0] || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
}
