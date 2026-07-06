export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'owner' | 'manager' | 'staff';
  isActive: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  loyaltyPoints: number;
  createdAt: string;
}

export interface OrderItem {
  id: string;
  menuId: string;
  menuName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  customerId?: string;
  customerName?: string;
  userId: string;
  serverName: string;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  phone: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unitOfMeasure: string;
  supplierId: string;
  minStockLevel: number;
}

export interface InventoryItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  currentStock: number;
  minStockLevel: number;
  unitOfMeasure: string;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  receivedAt: string;
}

export interface Payment {
  id: string;
  orderId: string;
  paymentMethod: 'cash' | 'card' | 'upi';
  status: 'completed' | 'refunded' | 'failed';
  amount: number;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface Bill {
  id: string;
  supplierId: string;
  supplierName: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid';
}

export interface Settings {
  restaurantName: string;
  address: string;
  gstin: string;
  fssai: string;
  taxRate: number;
  currency: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  attachmentType?: 'sales_summary' | 'low_stock' | 'recent_orders' | 'profit_details' | 'customers' | 'menu_items';
  attachmentData?: any;
}

export interface Notification {
  notification_id: string;
  title: string;
  message: string;
  type: 'inventory_low_stock' | 'sales_report' | 'finance_alert' | 'support_ticket' | 'analytics_insight';
  status: 'unread' | 'read';
  created_at: string;
  reference_id?: string;
  route: {
    agent: 'inventory' | 'sales' | 'finance' | 'support' | 'analytics';
    action: string;
  };
}

