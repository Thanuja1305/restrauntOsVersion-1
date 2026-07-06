import React, { useState, useEffect } from 'react';
import { Bot, LogIn, UserPlus, KeyRound, Mail, User, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { 
  User as UserType, 
  Settings as SettingsType, 
  Order, 
  MenuItem, 
  InventoryItem, 
  Customer, 
  Supplier, 
  Payment, 
  Expense, 
  Bill, 
  Message,
  Notification
} from './types';
import { useAuth } from './contexts/AuthContext';
import { useLoadingStore } from './store/useLoadingStore';
import { motion, AnimatePresence } from 'motion/react';

// Import subcomponents
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIAgentTab from './components/AIAgentTab';
import OrdersTab from './components/OrdersTab';
import MenuTab from './components/MenuTab';
import InventoryTab from './components/InventoryTab';
import CustomersTab from './components/CustomersTab';
import SuppliersTab from './components/SuppliersTab';
import FinanceTab from './components/FinanceTab';
import ReportsTab from './components/ReportsTab';
import SettingsTab from './components/SettingsTab';

export default function App() {
  const { token, user, isAuthenticated, login: authLogin, logout: authLogout } = useAuth();
  const { isGlobalLoading, isAuthChecking, setGlobalLoading, startRequest, endRequest } = useLoadingStore();
  const [activeTab, setActiveTab] = useState<string>('ai_agent');
  
  // App state
  const [settings, setSettings] = useState<SettingsType>({
    restaurantName: 'Spice Heaven',
    address: '23 Green Street, Hitech City, Hyderabad - 500081',
    gstin: '36ABCDE1234F1Z5',
    fssai: '13620012000456',
    taxRate: 5.0,
    currency: '₹'
  });
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  
  // Finance sub-states
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  
  // Chat state
  const [chatHistory, setChatHistory] = useState<Message[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeOrchestratedResult, setActiveOrchestratedResult] = useState<{
    notification: Notification;
    agent: string;
    action: string;
    data: any;
  } | null>(null);
  
  // Form controllers
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFirstName, setAuthFirstName] = useState('');
  const [authLastName, setAuthLastName] = useState('');
  const [authRole, setAuthRole] = useState<'owner' | 'manager' | 'staff'>('owner');
  
  // UX states
  const [authError, setAuthError] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState<boolean>(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);

  // Authenticated API request wrapper with safety, retries, and logging
  const apiFetch = async (endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    try {
      const res = await fetch(endpoint, { ...options, headers });
      if (!res.ok) {
        let errorData: any = {};
        try {
          errorData = await res.json();
        } catch {
          // ignore
        }
        throw new Error(errorData.error || errorData.detail || `Request failed with status ${res.status}`);
      }

      const text = await res.text();
      if (!text) return {};
      
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (err: any) {
        throw new Error(`JSON parsing failed: ${err.message}`);
      }

      if (data === null) {
        throw new Error("Invalid response format: null response received");
      }

      // Orchestrator validation guard (Rule 4)
      if (endpoint === '/api/chat' && options.method === 'POST') {
        if (!data || data.status !== 'ok' || !data.data || typeof data.data !== 'object') {
          throw new Error("Orchestrator returned an invalid payload structure.");
        }
      }

      return data;
    } catch (err: any) {
      const errorLog = {
        error_type: "APIFailure",
        source: "frontend",
        timestamp: new Date().toISOString(),
        payload_snapshot: {
          endpoint,
          method: options.method || 'GET',
          errorMessage: err.message,
          retryAttempt: retryCount
        }
      };
      console.error("Observability Failure Log:", JSON.stringify(errorLog, null, 2));

      if (retryCount < 1) {
        console.warn(`Retrying API call to ${endpoint} once...`);
        return apiFetch(endpoint, options, retryCount + 1);
      }
      throw err;
    }
  };

  // Fetch all databases when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAllDatabase();
    }
  }, [isAuthenticated]);

  // Loading timeout safety guard to prevent infinite loader freezes (Rule 6)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isGlobalLoading) {
      timer = setTimeout(() => {
        console.warn("Global loading state timed out after 10000ms. Auto-recovering loader state...");
        endRequest();
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isGlobalLoading, endRequest]);

  // Loader for all databases with safety guards (Rule 7)
  const loadAllDatabase = async () => {
    startRequest();
    try {
      const [
        settingsData,
        ordersData,
        menuData,
        inventoryData,
        customersData,
        suppliersData,
        financeData,
        chatData,
        notificationsData
      ] = await Promise.all([
        apiFetch('/api/settings').catch(() => null),
        apiFetch('/api/orders').catch(() => null),
        apiFetch('/api/menu').catch(() => null),
        apiFetch('/api/inventory').catch(() => null),
        apiFetch('/api/customers').catch(() => null),
        apiFetch('/api/suppliers').catch(() => null),
        apiFetch('/api/finance').catch(() => null),
        apiFetch('/api/chat').catch(() => null),
        apiFetch('/api/notifications').catch(() => null)
      ]);

      setSettings(settingsData || {
        restaurantName: 'Spice Heaven',
        address: '23 Green Street, Hitech City, Hyderabad - 500081',
        gstin: '36ABCDE1234F1Z5',
        fssai: '13620012000456',
        taxRate: 5.0,
        currency: '₹'
      });
      setOrders(ordersData || []);
      setMenu(menuData || []);
      setInventory(inventoryData || []);
      setCustomers(customersData || []);
      setSuppliers(suppliersData || []);
      setPayments(financeData?.payments || []);
      setExpenses(financeData?.expenses || []);
      setBills(financeData?.bills || []);
      setChatHistory(chatData || []);
      setNotifications(notificationsData || []);
    } catch (err) {
      console.error('Failed to load restaurant databases', err);
    } finally {
      endRequest();
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setGlobalLoading(true);

    try {
      if (authMode === 'login') {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });
        authLogin(data.token, data.user);
      } else {
        const data = await apiFetch('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({
            email: authEmail,
            password: authPassword,
            firstName: authFirstName,
            lastName: authLastName,
            role: authRole
          })
        });
        authLogin(data.token, data.user);
      }
      // Reset forms
      setAuthEmail('');
      setAuthPassword('');
      setAuthFirstName('');
      setAuthLastName('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication request failed.');
    } finally {
      setGlobalLoading(false);
    }
  };

  const handleLogout = () => {
    authLogout();
    setActiveTab('ai_agent');
  };

  // ==========================================
  // CORE API HANDLERS (Passed to sub-components)
  // ==========================================
  const handleCreateOrder = async (
    customerId: string | undefined, 
    items: { menuId: string; quantity: number; notes?: string }[], 
    discount?: number
  ) => {
    try {
      const newOrder = await apiFetch('/api/orders', {
        method: 'POST',
        body: JSON.stringify({ customerId, items, discount })
      });
      // Refresh database
      await loadAllDatabase();
    } catch (err: any) {
      alert(`POS Error: ${err.message}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await apiFetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Status Update Error: ${err.message}`);
    }
  };

  const handleAddMenuItem = async (item: Omit<MenuItem, 'id' | 'createdAt'>) => {
    try {
      await apiFetch('/api/menu', {
        method: 'POST',
        body: JSON.stringify(item)
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Menu Error: ${err.message}`);
    }
  };

  const handleToggleMenuAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await apiFetch(`/api/menu/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ isAvailable })
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Availability Error: ${err.message}`);
    }
  };

  const handleAdjustStock = async (ingredientId: string, adjustment: number) => {
    try {
      await apiFetch('/api/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({ ingredientId, adjustment })
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Inventory Error: ${err.message}`);
    }
  };

  const handleAddCustomer = async (cust: Omit<Customer, 'id' | 'createdAt' | 'loyaltyPoints'>) => {
    try {
      await apiFetch('/api/customers', {
        method: 'POST',
        body: JSON.stringify(cust)
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Customer Registration Error: ${err.message}`);
    }
  };

  const handleAddSupplier = async (supp: Omit<Supplier, 'id' | 'createdAt'>) => {
    try {
      await apiFetch('/api/suppliers', {
        method: 'POST',
        body: JSON.stringify(supp)
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Supplier Connection Error: ${err.message}`);
    }
  };

  const handleAddExpense = async (category: string, amount: number, description?: string) => {
    try {
      await apiFetch('/api/finance/expenses', {
        method: 'POST',
        body: JSON.stringify({ category, amount, description })
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Expense Logging Error: ${err.message}`);
    }
  };

  const handleAddBill = async (supplierId: string, amount: number, dueDate: string) => {
    try {
      await apiFetch('/api/finance/bills', {
        method: 'POST',
        body: JSON.stringify({ supplierId, amount, dueDate })
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Bill Invoice Error: ${err.message}`);
    }
  };

  const handleSettleBill = async (billId: string, status: 'paid' | 'unpaid') => {
    try {
      await apiFetch(`/api/finance/bills/${billId}`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      });
      await loadAllDatabase();
    } catch (err: any) {
      alert(`Liability Settle Error: ${err.message}`);
    }
  };

  const handleUpdateSettings = async (nextSettings: SettingsType) => {
    try {
      const updated = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(nextSettings)
      });
      setSettings(updated);
    } catch (err: any) {
      alert(`Settings Error: ${err.message}`);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      const data = await apiFetch('/api/notifications/mark-all-read', {
        method: 'POST'
      });
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (err: any) {
      console.error('Failed to mark all notifications as read', err);
    }
  };

  const handleNotificationClick = async (id: string) => {
    try {
      const data = await apiFetch(`/api/notifications/${id}/click`, {
        method: 'POST'
      });
      
      if (data.success) {
        // Update our local notifications list
        setNotifications(prev =>
          prev.map(n => n.notification_id === id ? { ...n, status: 'read' as const } : n)
        );

        // Navigate to correct domain tab
        if (data.navigationTarget) {
          setActiveTab(data.navigationTarget);
        }

        // Store Orchestrator output
        setActiveOrchestratedResult({
          notification: data.notification,
          agent: data.notification.route.agent,
          action: data.notification.route.action,
          data: data.routeData
        });
      }
    } catch (err: any) {
      console.error('Failed to process notification click', err);
    }
  };

  const handleSendMessage = async (text: string) => {
    setChatLoading(true);
    try {
      const data = await apiFetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text })
      });
      // Refresh chat and database since model triggers could change stocks/receipts
      await loadAllDatabase();
    } catch (err: any) {
      alert(`AI Agent Error: ${err.message}`);
    } finally {
      setChatLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      const data = await apiFetch('/api/chat/clear', { method: 'POST' });
      setChatHistory(data.chatHistory);
    } catch (err: any) {
      alert(`Error resetting conversation logs: ${err.message}`);
    }
  };

  // Loading Screen (Session verification phase)
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#071F14] text-white flex flex-col items-center justify-center gap-4">
        <Bot className="w-12 h-12 text-emerald-400 animate-bounce" />
        <h2 className="text-sm font-semibold uppercase tracking-widest font-mono">Loading RestaurantOS AI</h2>
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs text-emerald-300">Synchronizing database...</span>
        </div>
      </div>
    );
  }

  // Login & Registration screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-radial from-[#123624] to-[#07170E] flex items-center justify-center p-4 select-none relative overflow-hidden">
        
        {/* Floating Background Glow Orbs */}
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20 relative z-10 animate-scale-up">
          
          {/* Logo Title header */}
          <div className="text-center space-y-3 mb-8">
            <div className="mx-auto w-14 h-14 bg-emerald-600 text-white flex items-center justify-center rounded-2xl shadow-xl shadow-emerald-600/15">
              <Bot className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight leading-none">RestaurantOS AI</h2>
              <p className="text-xs text-gray-500 mt-2 font-medium">Digital operating system for your gourmet business</p>
            </div>
          </div>

          {/* Form container */}
          <form onSubmit={handleAuthSubmit} className="space-y-4.5 text-xs text-gray-700">
            
            {/* Error badge */}
            {authError && (
              <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-xl flex items-start gap-2 animate-fade-in font-medium">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            {/* Registration specific fields */}
            {authMode === 'register' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={authFirstName}
                      onChange={(e) => setAuthFirstName(e.target.value)}
                      placeholder="Spice"
                      className="w-full text-xs font-semibold text-gray-700 border border-gray-200 focus:border-emerald-500 bg-gray-50/50 focus:bg-white rounded-xl pl-9 pr-3 py-2.5 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-600 uppercase tracking-wider block">Last Name</label>
                  <input
                    type="text"
                    required
                    value={authLastName}
                    onChange={(e) => setAuthLastName(e.target.value)}
                    placeholder="Heaven"
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 focus:border-emerald-500 bg-gray-50/50 focus:bg-white rounded-xl px-4 py-2.5 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600 uppercase tracking-wider block font-semibold">Business Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="owner@spiceheaven.com"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 focus:border-emerald-500 bg-gray-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="font-bold text-gray-600 uppercase tracking-wider block font-semibold">Secret Password</label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-xs font-semibold text-gray-700 border border-gray-200 focus:border-emerald-500 bg-gray-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 outline-none transition-all"
                />
              </div>
            </div>

            {/* Role dropdown for registration */}
            {authMode === 'register' && (
              <div className="space-y-1.5">
                <label className="font-bold text-gray-600 uppercase tracking-wider block">Organizational Role</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={authRole}
                    onChange={(e) => setAuthRole(e.target.value as any)}
                    className="w-full text-xs font-semibold text-gray-700 border border-gray-200 focus:border-emerald-500 bg-gray-50/50 focus:bg-white rounded-xl pl-10 pr-4 py-2.5 bg-white outline-none transition-all"
                  >
                    <option value="owner">Restaurant Owner</option>
                    <option value="manager">Restaurant Manager</option>
                    <option value="staff">Operational Staff</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isGlobalLoading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-extrabold text-xs shadow-md shadow-emerald-600/10 active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
            >
              {isGlobalLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting Securely...</span>
                </>
              ) : authMode === 'login' ? (
                <>
                  <LogIn className="w-4.5 h-4.5" />
                  <span>Authenticate Securely</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" />
                  <span>Initialize Account</span>
                </>
              )}
            </button>


          </form>

          {/* Quick toggle mode links */}
          <div className="mt-6 text-center text-xs">
            {authMode === 'login' ? (
              <p className="text-gray-500">
                New to the platform?{' '}
                <button 
                  onClick={() => { setAuthMode('register'); setAuthError(null); }} 
                  className="font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Create business account
                </button>
              </p>
            ) : (
              <p className="text-gray-500">
                Already have an account?{' '}
                <button 
                  onClick={() => { setAuthMode('login'); setAuthError(null); }} 
                  className="font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  Authenticate profile
                </button>
              </p>
            )}
          </div>

          {/* Seed credentials hints box */}
          <div className="mt-6 bg-gray-50 border border-gray-100 p-4 rounded-xl text-[11px] leading-relaxed text-gray-500">
            🔑 <strong>Demo Access Credentials:</strong><br />
            Email: <span className="font-mono text-emerald-700 font-bold">owner@spiceheaven.com</span><br />
            Password: <span className="font-mono text-emerald-700 font-bold">password123</span>
          </div>

        </div>
      </div>
    );
  }

  // Dashboard shells layout
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50 text-gray-800 antialiased font-sans relative">
      
      {/* Seamless Top Progress Bar for API synchronizations */}
      {isGlobalLoading && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-emerald-100 z-[100] overflow-hidden">
          <div className="h-full bg-emerald-600 animate-pulse w-full" />
        </div>
      )}
      
      {/* Sidebar Panel */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        settings={settings} 
        onLogout={handleLogout}
        user={user}
      />

      {/* Main Work Stage */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header Bar */}
        <Header 
          settings={settings} 
          user={user} 
          lowStockItemsCount={inventory.filter(i => i.currentStock < i.minStockLevel).length}
          notifications={notifications}
          onMarkAllRead={handleMarkAllNotificationsRead}
          onNotificationClick={handleNotificationClick}
        />

        {/* Dynamic Inner Tab Stage */}
        <main className="flex-1 overflow-hidden relative">
          
          {activeTab === 'ai_agent' && (
            <AIAgentTab 
              settings={settings}
              chatHistory={chatHistory}
              onSendMessage={handleSendMessage}
              onClearChat={handleClearChat}
              isLoading={chatLoading}
              onSwitchTab={setActiveTab}
              triggerNewOrder={() => setIsNewOrderModalOpen(true)}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              menu={menu}
              customers={customers}
              settings={settings}
              onCreateOrder={handleCreateOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              isCreateModalOpen={isNewOrderModalOpen}
              setIsCreateModalOpen={setIsNewOrderModalOpen}
            />
          )}

          {activeTab === 'menu' && (
            <MenuTab
              menu={menu}
              settings={settings}
              onAddMenuItem={handleAddMenuItem}
              onToggleAvailability={handleToggleMenuAvailability}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryTab
              inventory={inventory}
              settings={settings}
              onAdjustStock={handleAdjustStock}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersTab
              customers={customers}
              onAddCustomer={handleAddCustomer}
            />
          )}

          {activeTab === 'suppliers' && (
            <SuppliersTab
              suppliers={suppliers}
              onAddSupplier={handleAddSupplier}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              payments={payments}
              expenses={expenses}
              bills={bills}
              suppliers={suppliers}
              settings={settings}
              onAddExpense={handleAddExpense}
              onAddBill={handleAddBill}
              onSettleBill={handleSettleBill}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsTab
              orders={orders}
              menu={menu}
              customers={customers}
              inventory={inventory}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

        </main>
      </div>

      {/* Orchestrated Agent Data Modal */}
      <AnimatePresence>
        {activeOrchestratedResult && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1000] p-4 font-sans select-none animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full border border-gray-100 shadow-2xl relative"
            >
              <button
                onClick={() => setActiveOrchestratedResult(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors cursor-pointer text-xs font-bold border-none"
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5 border-b border-gray-100 pb-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                  🤖
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {activeOrchestratedResult.agent} Agent Active
                  </span>
                  <h3 className="text-sm font-extrabold text-gray-900 mt-1">
                    {activeOrchestratedResult.notification.title}
                  </h3>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100 text-xs text-gray-600 leading-relaxed">
                  <span className="font-bold text-gray-800 block mb-1">Triggering Alert</span>
                  "{activeOrchestratedResult.notification.message}"
                </div>

                <div className="bg-emerald-50/20 rounded-2xl p-4 border border-emerald-500/10">
                  <span className="font-bold text-emerald-800 text-xs block mb-2.5 flex items-center gap-1.5 font-sans">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Live Agent Retrieval Output
                  </span>
                  
                  {/* Dynamic Rendering of Agent response data */}
                  <div className="text-xs font-mono text-gray-700 bg-white/80 rounded-xl p-3 border border-emerald-500/5 max-h-48 overflow-y-auto">
                    {activeOrchestratedResult.agent === 'inventory' && Array.isArray(activeOrchestratedResult.data) && (
                      <div className="space-y-2">
                        <p className="font-sans font-bold text-gray-800">Critical Stock Status:</p>
                        <table className="w-full text-left font-sans text-xs">
                          <thead>
                            <tr className="border-b border-gray-100 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                              <th className="pb-1.5">Ingredient</th>
                              <th className="pb-1.5 text-right">Current Stock</th>
                              <th className="pb-1.5 text-right">Min Threshold</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {activeOrchestratedResult.data.map((item: any) => (
                              <tr key={item.ingredientId} className="text-gray-700">
                                <td className="py-1.5 font-semibold text-gray-900">{item.name}</td>
                                <td className="py-1.5 text-right text-red-600 font-bold font-mono">{item.currentStock} {item.unitOfMeasure}</td>
                                <td className="py-1.5 text-right font-mono text-gray-500">{item.minStockLevel} {item.unitOfMeasure}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeOrchestratedResult.agent === 'sales' && (
                      <div className="space-y-2 font-sans">
                        <p className="font-sans font-bold text-gray-800">Sales Summary Retrieved:</p>
                        <div className="grid grid-cols-2 gap-3.5 mt-2">
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">Net Revenue</span>
                            <span className="text-sm font-black text-emerald-600 font-mono mt-0.5 block">{activeOrchestratedResult.data.currency}{activeOrchestratedResult.data.revenueToday?.toLocaleString()}</span>
                          </div>
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">Total Checks</span>
                            <span className="text-sm font-black text-gray-800 font-mono mt-0.5 block">{activeOrchestratedResult.data.totalOrders}</span>
                          </div>
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">Avg Check Size</span>
                            <span className="text-sm font-black text-gray-800 font-mono mt-0.5 block">{activeOrchestratedResult.data.currency}{activeOrchestratedResult.data.averageCheckSize}</span>
                          </div>
                          <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                            <span className="text-[9px] uppercase tracking-wider text-gray-400 font-extrabold block">UPI Confirmed</span>
                            <span className="text-sm font-black text-emerald-600 font-mono mt-0.5 block">100%</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeOrchestratedResult.agent === 'finance' && (
                      <div className="space-y-2 font-sans">
                        <p className="font-sans font-bold text-gray-800">Financial Assets & Liability Status:</p>
                        <div className="space-y-2 mt-2">
                          <div className="flex justify-between items-center bg-red-50/50 p-2 rounded-xl border border-red-50">
                            <span className="text-xs text-red-800 font-semibold">Unpaid Liability (Bills):</span>
                            <span className="text-xs font-bold text-red-600 font-mono">{activeOrchestratedResult.data.currency}{activeOrchestratedResult.data.totalBillsAmount?.toLocaleString()} ({activeOrchestratedResult.data.unpaidBillsCount} bills)</span>
                          </div>
                          <div className="flex justify-between items-center bg-gray-50 p-2 rounded-xl border border-gray-100">
                            <span className="text-xs text-gray-700 font-semibold">Total Expenses Recorded:</span>
                            <span className="text-xs font-bold text-gray-900 font-mono">{activeOrchestratedResult.data.currency}{activeOrchestratedResult.data.totalExpenses?.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeOrchestratedResult.agent === 'support' && (
                      <div className="space-y-2 font-sans text-xs">
                        <p className="font-bold text-gray-800 mb-2">Priority Customer Support Ticket:</p>
                        <div className="border border-gray-100 rounded-xl p-3 bg-gray-50 space-y-1.5 font-sans">
                          <div className="flex justify-between"><span className="text-gray-400">Ticket ID:</span><span className="font-mono font-bold text-gray-700">{activeOrchestratedResult.data.ticketId}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Customer:</span><span className="font-semibold text-gray-800">{activeOrchestratedResult.data.customerName}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Issue Category:</span><span className="font-semibold text-gray-800">{activeOrchestratedResult.data.category}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Priority Level:</span><span className="px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold text-red-600 bg-red-50 border border-red-100 rounded-full">{activeOrchestratedResult.data.priority}</span></div>
                          <div className="flex justify-between"><span className="text-gray-400">Current Status:</span><span className="px-1.5 py-0.5 text-[9px] uppercase font-mono font-bold text-amber-600 bg-amber-50 border border-amber-100 rounded-full">{activeOrchestratedResult.data.status}</span></div>
                        </div>
                      </div>
                    )}

                    {activeOrchestratedResult.agent === 'analytics' && (
                      <div className="space-y-2 font-sans text-xs">
                        <p className="font-bold text-gray-800 mb-2">Cognitive AI Analytics Insights:</p>
                        <div className="space-y-2 font-sans">
                          <div className="bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-500/10 text-emerald-800 font-medium leading-relaxed font-sans">
                            🧠 <strong>AI Recommendation:</strong> {activeOrchestratedResult.data.aiInsight}
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2 font-sans">
                            <div className="bg-gray-50 p-2 rounded-xl text-center border border-gray-100 font-sans">
                              <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold">Busiest Period</span>
                              <span className="text-xs font-bold text-gray-800 block mt-0.5">{activeOrchestratedResult.data.busiestHours}</span>
                            </div>
                            <div className="bg-gray-50 p-2 rounded-xl text-center border border-gray-100 font-sans">
                              <span className="text-[8px] uppercase tracking-wider text-gray-400 block font-bold">Top Contributor</span>
                              <span className="text-xs font-bold text-gray-800 block mt-0.5">{activeOrchestratedResult.data.topSellingCategory}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 mt-6">
                <span className="text-[10px] text-gray-400 font-medium font-sans">
                  Routing Context: {activeOrchestratedResult.notification.route.action}()
                </span>
                <button
                  onClick={() => setActiveOrchestratedResult(null)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/10 transition-colors cursor-pointer border-none"
                >
                  Acknowledge & Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
