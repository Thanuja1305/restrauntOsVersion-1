import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'restaurant-os-super-secret-key-13579';

// Setup Data Directory and Persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial Database Seeding matching the screenshot exactly
const DEFAULT_SETTINGS = {
  restaurantName: "Spice Heaven",
  address: "23 Green Street, Hitech City, Hyderabad - 500081",
  gstin: "36ABCDE1234F1Z5",
  fssai: "13620012000456",
  taxRate: 5.0,
  currency: "₹"
};

const DEFAULT_USERS = [
  {
    id: "usr_1",
    email: "owner@spiceheaven.com",
    firstName: "Spice",
    lastName: "Heaven",
    // bcrypt hash for "password123"
    passwordHash: bcrypt.hashSync("password123", 10),
    role: "owner",
    isActive: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_CUSTOMERS = [
  { id: "cust_1", name: "Ananya Rao", phone: "9876543210", email: "ananya@gmail.com", loyaltyPoints: 350, createdAt: new Date().toISOString() },
  { id: "cust_2", name: "Vikram Malhotra", phone: "9123456789", email: "vikram@yahoo.com", loyaltyPoints: 120, createdAt: new Date().toISOString() },
  { id: "cust_3", name: "Rohan Sharma", phone: "9345678120", email: "rohan@gmail.com", loyaltyPoints: 50, createdAt: new Date().toISOString() },
  { id: "cust_4", name: "Priya Nair", phone: "9456123780", email: "priya@outlook.com", loyaltyPoints: 580, createdAt: new Date().toISOString() },
  { id: "cust_5", name: "Siddharth Sen", phone: "9678123450", email: "sid@gmail.com", loyaltyPoints: 210, createdAt: new Date().toISOString() }
];

const DEFAULT_MENU = [
  { id: "menu_1", name: "Masala Dosa", description: "Crispy crepe stuffed with spiced potato mash, served with sambar and chutneys.", price: 120, category: "Mains", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_2", name: "Paneer Butter Masala", description: "Soft paneer cubes in a rich, creamy, lightly sweet tomato-based gravy.", price: 220, category: "Mains", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_3", name: "Garlic Naan", description: "Traditional flatbread leavened and baked in tandoor, infused with fresh garlic.", price: 40, category: "Bread", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_4", name: "Butter Naan", description: "Leavened flatbread brushed with premium melted butter.", price: 35, category: "Bread", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_5", name: "Samosa", description: "Crisp flaky pastry shells filled with savory potatoes and peas.", price: 50, category: "Starters", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_6", name: "Filter Coffee", description: "Traditional South Indian frothy milk coffee brewed with chicory blend.", price: 40, category: "Beverages", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_7", name: "Mango Lassi", description: "Refreshing yogurt beverage blended with sweet mango pulp.", price: 80, category: "Beverages", isAvailable: true, createdAt: new Date().toISOString() },
  { id: "menu_8", name: "Chicken Biryani", description: "Fragrant basmati rice layered with spiced chicken, saffron, and aromatic herbs.", price: 250, category: "Mains", isAvailable: true, createdAt: new Date().toISOString() }
];

const DEFAULT_SUPPLIERS = [
  { id: "supp_1", name: "Greenfield Farms", contactName: "Rajesh Kumar", phone: "9812345670", email: "orders@greenfield.com", address: "Sector 5, Agritech Zone, Hyderabad", createdAt: new Date().toISOString() },
  { id: "supp_2", name: "Krishna Dairy", contactName: "Gopal Krishna", phone: "9823456781", email: "sales@krishnadairy.com", address: "Gachibowli, Hyderabad", createdAt: new Date().toISOString() },
  { id: "supp_3", name: "A-One Grocery Hub", contactName: "Amit Shah", phone: "9834567892", email: "amit@aonegrocery.com", address: "Begumpet, Hyderabad", createdAt: new Date().toISOString() }
];

const DEFAULT_INGREDIENTS = [
  { id: "ing_1", name: "Tomatoes", unitOfMeasure: "kg", supplierId: "supp_1", minStockLevel: 10.0 },
  { id: "ing_2", name: "Onions", unitOfMeasure: "kg", supplierId: "supp_1", minStockLevel: 15.0 },
  { id: "ing_3", name: "Paneer", unitOfMeasure: "kg", supplierId: "supp_2", minStockLevel: 5.0 },
  { id: "ing_4", name: "Refined Oil", unitOfMeasure: "liters", supplierId: "supp_3", minStockLevel: 8.0 },
  { id: "ing_5", name: "Basmati Rice", unitOfMeasure: "kg", supplierId: "supp_3", minStockLevel: 20.0 },
  { id: "ing_6", name: "Chicken Breast", unitOfMeasure: "kg", supplierId: "supp_3", minStockLevel: 12.0 }
];

const DEFAULT_INVENTORY = [
  { id: "inv_1", ingredientId: "ing_1", currentStock: 2.5 }, // Low stock (min: 10.0)
  { id: "inv_2", ingredientId: "ing_2", currentStock: 3.0 }, // Low stock (min: 15.0)
  { id: "inv_3", ingredientId: "ing_3", currentStock: 1.2 }, // Low stock (min: 5.0)
  { id: "inv_4", ingredientId: "ing_4", currentStock: 1.0 }, // Low stock (min: 8.0)
  { id: "inv_5", ingredientId: "ing_5", currentStock: 25.0 }, // Good stock
  { id: "inv_6", ingredientId: "ing_6", currentStock: 18.0 }  // Good stock
];

// Seed some pre-computed order data for Today to match exactly ₹25,430 and 42 orders!
// Average Order Value = 25,430 / 42 = 605.47!
// Let's create a healthy list of completed orders representing this.
const DEFAULT_ORDERS: any[] = [];
// Generate exactly 41 dummy completed orders + some detailed ones to total ₹25,430!
let runningTotal = 0;
for (let i = 1; i <= 40; i++) {
  // Average around ₹500
  const subtotal = Math.floor(Math.random() * 300) + 250;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;
  runningTotal += total;
  DEFAULT_ORDERS.push({
    id: `ord_dummy_${i}`,
    customerId: i % 3 === 0 ? `cust_${(i % 5) + 1}` : undefined,
    customerName: i % 3 === 0 ? DEFAULT_CUSTOMERS[i % 5].name : "Walk-in Guest",
    userId: "usr_1",
    serverName: "Spice Heaven Team",
    status: "completed",
    subtotal,
    tax,
    discount: 0,
    total,
    items: [
      { id: `item_${i}_1`, menuId: "menu_1", menuName: "Masala Dosa", quantity: 2, unitPrice: 120 }
    ],
    createdAt: new Date().toISOString()
  });
}

// Add the 41st and 42nd orders with exact amounts to top up to ₹25,430!
const target = 25430;
const diff = target - runningTotal; // Should be around ₹5000-6000
const order41Total = Math.floor(diff * 0.5);
const order42Total = diff - order41Total;

DEFAULT_ORDERS.push({
  id: "ord_41",
  customerId: "cust_1",
  customerName: "Ananya Rao",
  userId: "usr_1",
  serverName: "Spice Heaven Team",
  status: "completed",
  subtotal: Math.round(order41Total / 1.05 * 100) / 100,
  tax: Math.round((order41Total - (order41Total / 1.05)) * 100) / 100,
  discount: 0,
  total: order41Total,
  items: [
    { id: "item_41_1", menuId: "menu_8", menuName: "Chicken Biryani", quantity: 5, unitPrice: 250 },
    { id: "item_41_2", menuId: "menu_7", menuName: "Mango Lassi", quantity: 4, unitPrice: 80 }
  ],
  createdAt: new Date().toISOString()
});

DEFAULT_ORDERS.push({
  id: "ord_42",
  customerId: "cust_4",
  customerName: "Priya Nair",
  userId: "usr_1",
  serverName: "Spice Heaven Team",
  status: "completed",
  subtotal: Math.round(order42Total / 1.05 * 100) / 100,
  tax: Math.round((order42Total - (order42Total / 1.05)) * 100) / 100,
  discount: 0,
  total: order42Total,
  items: [
    { id: "item_42_1", menuId: "menu_2", menuName: "Paneer Butter Masala", quantity: 6, unitPrice: 220 },
    { id: "item_42_2", menuId: "menu_3", menuName: "Garlic Naan", quantity: 10, unitPrice: 40 }
  ],
  createdAt: new Date().toISOString()
});

const DEFAULT_PAYMENTS = DEFAULT_ORDERS.map((ord, idx) => ({
  id: `pay_${idx + 1}`,
  orderId: ord.id,
  paymentMethod: idx % 3 === 0 ? "card" : idx % 3 === 1 ? "upi" : "cash",
  status: "completed",
  amount: ord.total,
  createdAt: ord.createdAt
}));

const DEFAULT_EXPENSES = [
  { id: "exp_1", category: "utilities", amount: 4500, description: "Monthly electricity bill", expenseDate: new Date().toISOString().split('T')[0] },
  { id: "exp_2", category: "rent", amount: 15000, description: "Commercial lease rent", expenseDate: new Date().toISOString().split('T')[0] },
  { id: "exp_3", category: "inventory", amount: 8400, description: "Procured dairy goods from Krishna Dairy", expenseDate: new Date().toISOString().split('T')[0] }
];

const DEFAULT_BILLS = [
  { id: "bill_1", supplierId: "supp_2", supplierName: "Krishna Dairy", amount: 8400, dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0], status: "paid" },
  { id: "bill_2", supplierId: "supp_1", supplierName: "Greenfield Farms", amount: 3200, dueDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0], status: "unpaid" }
];

const DEFAULT_PURCHASES = [
  { id: "pur_1", supplierId: "supp_2", supplierName: "Krishna Dairy", ingredientId: "ing_3", ingredientName: "Paneer", quantity: 20, unitCost: 180, totalCost: 3600, receivedAt: new Date().toISOString() },
  { id: "pur_2", supplierId: "supp_1", supplierName: "Greenfield Farms", ingredientId: "ing_1", ingredientName: "Tomatoes", quantity: 50, unitCost: 40, totalCost: 2000, receivedAt: new Date().toISOString() }
];

const DEFAULT_CHAT_HISTORY = [
  {
    id: "msg_init",
    role: "assistant",
    content: "I'm your Restaurant AI Agent 🤖\nI can help you with orders, inventory, finance, customers, suppliers, reports and much more.",
    timestamp: "10:29 AM"
  },
  {
    id: "msg_user_1",
    role: "user",
    content: "Show today's sales summary",
    timestamp: "10:30 AM"
  },
  {
    id: "msg_agent_1",
    role: "assistant",
    content: "Here is today's sales summary",
    timestamp: "10:30 AM",
    attachmentType: "sales_summary",
    attachmentData: {
      totalOrders: 42,
      totalRevenue: 25430,
      averageOrderValue: 605,
      topSellingItem: "Masala Dosa (18)"
    }
  },
  {
    id: "msg_user_2",
    role: "user",
    content: "Show low stock items",
    timestamp: "10:31 AM"
  },
  {
    id: "msg_agent_2",
    role: "assistant",
    content: "Low stock items:",
    timestamp: "10:31 AM",
    attachmentType: "low_stock",
    attachmentData: [
      { name: "Tomatoes", stock: "2.5 kg" },
      { name: "Onions", stock: "3 kg" },
      { name: "Paneer", stock: "1.2 kg" },
      { name: "Oil", stock: "1.0 L" }
    ]
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    notification_id: "notif_1",
    title: "Ingredients Stock Warning",
    message: "4 ingredients have crossed minimum stock thresholds.",
    type: "inventory_low_stock",
    status: "unread",
    created_at: new Date(Date.now() - 30000).toISOString(),
    reference_id: "inv_1",
    route: {
      agent: "inventory",
      action: "getLowStockItems"
    }
  },
  {
    notification_id: "notif_2",
    title: "Order Processed",
    message: "Order #ord_42 successfully processed with UPI receipt confirmation.",
    type: "sales_report",
    status: "unread",
    created_at: new Date(Date.now() - 900000).toISOString(),
    reference_id: "ord_42",
    route: {
      agent: "sales",
      action: "getDailySalesReport"
    }
  },
  {
    notification_id: "notif_3",
    title: "Operational Report Ready",
    message: "Weekly operational report is compiled and ready for auditing.",
    type: "analytics_insight",
    status: "unread",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    reference_id: "report_weekly",
    route: {
      agent: "analytics",
      action: "getAnalyticsInsights"
    }
  },
  {
    notification_id: "notif_4",
    title: "Supplier Bill Warning",
    message: "Supplier bill #bill_2 for Greenfield Farms is due in 10 days.",
    type: "finance_alert",
    status: "unread",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    reference_id: "bill_2",
    route: {
      agent: "finance",
      action: "getFinancialStatus"
    }
  },
  {
    notification_id: "notif_5",
    title: "Customer Ticket Raised",
    message: "VIP Customer Priya Nair raised a support ticket for delayed delivery.",
    type: "support_ticket",
    status: "unread",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    reference_id: "ticket_102",
    route: {
      agent: "support",
      action: "getSupportTickets"
    }
  }
];

let db: {
  users: any[];
  customers: any[];
  menu: any[];
  suppliers: any[];
  ingredients: any[];
  inventory: any[];
  orders: any[];
  payments: any[];
  expenses: any[];
  bills: any[];
  purchases: any[];
  settings: any;
  chatHistory: any[];
  notifications: any[];
};

if (fs.existsSync(DB_FILE)) {
  try {
    db = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
    console.log("Database loaded successfully from local file system.");
    if (!db.notifications) {
      db.notifications = DEFAULT_NOTIFICATIONS;
      saveDb();
    }
  } catch (err) {
    console.error("Failed to parse local DB file. Falling back to clean seed data.", err);
    seedCleanDb();
  }
} else {
  seedCleanDb();
}

function seedCleanDb() {
  db = {
    users: DEFAULT_USERS,
    customers: DEFAULT_CUSTOMERS,
    menu: DEFAULT_MENU,
    suppliers: DEFAULT_SUPPLIERS,
    ingredients: DEFAULT_INGREDIENTS,
    inventory: DEFAULT_INVENTORY,
    orders: DEFAULT_ORDERS,
    payments: DEFAULT_PAYMENTS,
    expenses: DEFAULT_EXPENSES,
    bills: DEFAULT_BILLS,
    purchases: DEFAULT_PURCHASES,
    settings: DEFAULT_SETTINGS,
    chatHistory: DEFAULT_CHAT_HISTORY,
    notifications: DEFAULT_NOTIFICATIONS
  };
  saveDb();
}

function saveDb() {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// Instantiate Express App
const app = express();
app.use(express.json());

// JWT Auth Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required. Please sign in.' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired access token.' });
    }
    req.user = user;
    next();
  });
};

// ==========================================
// AUTH ENDPOINTS
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { email, password, firstName, lastName, role } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'Missing registration details.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existingUser = db.users.find(u => u.email === normalizedEmail);
  if (existingUser) {
    return res.status(400).json({ error: 'An account with this email already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = {
    id: `usr_${Date.now()}`,
    email: normalizedEmail,
    firstName,
    lastName,
    passwordHash,
    role: role || 'staff',
    isActive: true,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDb();

  const token = jwt.sign(
    { id: newUser.id, email: newUser.email, role: newUser.role, name: `${newUser.firstName} ${newUser.lastName}` },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { passwordHash: _, ...userWithoutPassword } = newUser;
  res.status(201).json({
    token,
    user: userWithoutPassword
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = db.users.find(u => u.email === normalizedEmail);

  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid email or password combination.' });
  }

  if (!user.isActive) {
    return res.status(403).json({ error: 'This user account has been disabled.' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: `${user.firstName} ${user.lastName}` },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json({
    token,
    user: userWithoutPassword
  });
});

app.get('/api/auth/me', authenticateToken, (req: any, res) => {
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  const { passwordHash: _, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// ==========================================
// ORDERS ENDPOINTS
// ==========================================
app.get('/api/orders', authenticateToken, (req, res) => {
  const query = (req.query.search || '').toString().toLowerCase();
  let results = db.orders;

  if (query) {
    results = results.filter(o => 
      o.id.toLowerCase().includes(query) || 
      (o.customerName && o.customerName.toLowerCase().includes(query)) ||
      o.status.toLowerCase().includes(query)
    );
  }

  res.json(results);
});

app.post('/api/orders', authenticateToken, (req: any, res) => {
  const { customerId, items, discount } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'An order must contain at least one item.' });
  }

  // Find customer
  const customer = customerId ? db.customers.find(c => c.id === customerId) : null;

  // Process items and calculate prices
  let subtotal = 0;
  const processedItems = items.map((item: any) => {
    const menuItem = db.menu.find(m => m.id === item.menuId);
    if (!menuItem) {
      throw new Error(`Menu item ${item.menuId} not found.`);
    }

    const itemPrice = menuItem.price;
    subtotal += itemPrice * item.quantity;

    return {
      id: `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      menuId: item.menuId,
      menuName: menuItem.name,
      quantity: item.quantity,
      unitPrice: itemPrice,
      notes: item.notes || ''
    };
  });

  const discVal = discount || 0;
  const taxRate = db.settings.taxRate || 5.0;
  const tax = Math.round((subtotal - discVal) * (taxRate / 100) * 100) / 100;
  const total = Math.round((subtotal - discVal + tax) * 100) / 100;

  const newOrder = {
    id: `ord_${Date.now()}`,
    customerId: customer ? customer.id : undefined,
    customerName: customer ? customer.name : 'Walk-in Guest',
    userId: req.user.id,
    serverName: req.user.name || 'Team member',
    status: 'pending',
    subtotal,
    tax,
    discount: discVal,
    total,
    items: processedItems,
    createdAt: new Date().toISOString()
  };

  db.orders.push(newOrder);

  // Update customer loyalty points if customer exists
  if (customer) {
    customer.loyaltyPoints += Math.floor(total / 10); // 1 point for every 10 currency units
  }

  saveDb();
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', authenticateToken, (req, res) => {
  const order = db.orders.find(o => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const { status } = req.body;
  if (status) {
    order.status = status;
  }

  saveDb();
  res.json(order);
});

// ==========================================
// MENU ENDPOINTS
// ==========================================
app.get('/api/menu', authenticateToken, (req, res) => {
  const query = (req.query.search || '').toString().toLowerCase();
  let results = db.menu;

  if (query) {
    results = results.filter(m => 
      m.name.toLowerCase().includes(query) || 
      m.category.toLowerCase().includes(query) ||
      (m.description && m.description.toLowerCase().includes(query))
    );
  }

  res.json(results);
});

app.post('/api/menu', authenticateToken, (req, res) => {
  const { name, description, price, category, isAvailable } = req.body;

  if (!name || price === undefined || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required.' });
  }

  const newItem = {
    id: `menu_${Date.now()}`,
    name,
    description: description || '',
    price: Number(price),
    category,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
    createdAt: new Date().toISOString()
  };

  db.menu.push(newItem);
  saveDb();
  res.status(201).json(newItem);
});

app.put('/api/menu/:id', authenticateToken, (req, res) => {
  const item = db.menu.find(m => m.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const { name, description, price, category, isAvailable } = req.body;
  if (name !== undefined) item.name = name;
  if (description !== undefined) item.description = description;
  if (price !== undefined) item.price = Number(price);
  if (category !== undefined) item.category = category;
  if (isAvailable !== undefined) item.isAvailable = isAvailable;

  saveDb();
  res.json(item);
});

// ==========================================
// INVENTORY ENDPOINTS
// ==========================================
app.get('/api/inventory', authenticateToken, (req, res) => {
  const query = (req.query.search || '').toString().toLowerCase();
  
  const mappedInventory = db.inventory.map(inv => {
    const ing = db.ingredients.find(i => i.id === inv.ingredientId);
    return {
      id: inv.id,
      ingredientId: inv.ingredientId,
      ingredientName: ing ? ing.name : 'Unknown Ingredient',
      currentStock: inv.currentStock,
      minStockLevel: ing ? ing.minStockLevel : 0,
      unitOfMeasure: ing ? ing.unitOfMeasure : 'units'
    };
  });

  let results = mappedInventory;
  if (query) {
    results = results.filter(item => 
      item.ingredientName.toLowerCase().includes(query)
    );
  }

  res.json(results);
});

app.post('/api/inventory/adjust', authenticateToken, (req, res) => {
  const { ingredientId, adjustment } = req.body;

  if (!ingredientId || adjustment === undefined) {
    return res.status(400).json({ error: 'Ingredient ID and adjustment amount are required.' });
  }

  const invItem = db.inventory.find(i => i.ingredientId === ingredientId);
  if (!invItem) {
    return res.status(404).json({ error: 'Inventory stock record not found.' });
  }

  invItem.currentStock = Math.max(0, invItem.currentStock + Number(adjustment));
  invItem.lastUpdated = new Date().toISOString();

  saveDb();

  const ing = db.ingredients.find(i => i.id === ingredientId);
  res.json({
    id: invItem.id,
    ingredientId,
    ingredientName: ing ? ing.name : 'Unknown',
    currentStock: invItem.currentStock,
    minStockLevel: ing ? ing.minStockLevel : 0,
    unitOfMeasure: ing ? ing.unitOfMeasure : 'units'
  });
});

// ==========================================
// CUSTOMERS ENDPOINTS
// ==========================================
app.get('/api/customers', authenticateToken, (req, res) => {
  const query = (req.query.search || '').toString().toLowerCase();
  let results = db.customers;

  if (query) {
    results = results.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.phone.includes(query) ||
      (c.email && c.email.toLowerCase().includes(query))
    );
  }

  res.json(results);
});

app.post('/api/customers', authenticateToken, (req, res) => {
  const { name, phone, email } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Customer name and phone are required.' });
  }

  const newCust = {
    id: `cust_${Date.now()}`,
    name,
    phone,
    email: email || '',
    loyaltyPoints: 0,
    createdAt: new Date().toISOString()
  };

  db.customers.push(newCust);
  saveDb();
  res.status(201).json(newCust);
});

// ==========================================
// SUPPLIERS ENDPOINTS
// ==========================================
app.get('/api/suppliers', authenticateToken, (req, res) => {
  const query = (req.query.search || '').toString().toLowerCase();
  let results = db.suppliers;

  if (query) {
    results = results.filter(s => 
      s.name.toLowerCase().includes(query) || 
      (s.contactName && s.contactName.toLowerCase().includes(query)) ||
      s.phone.includes(query)
    );
  }

  res.json(results);
});

app.post('/api/suppliers', authenticateToken, (req, res) => {
  const { name, contactName, phone, email, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Supplier name and phone are required.' });
  }

  const newSupp = {
    id: `supp_${Date.now()}`,
    name,
    contactName: contactName || '',
    phone,
    email: email || '',
    address: address || '',
    createdAt: new Date().toISOString()
  };

  db.suppliers.push(newSupp);
  saveDb();
  res.status(201).json(newSupp);
});

// ==========================================
// FINANCE / PAYMENTS / BILLS / EXPENSES
// ==========================================
app.get('/api/finance', authenticateToken, (req, res) => {
  res.json({
    payments: db.payments,
    expenses: db.expenses,
    bills: db.bills
  });
});

app.post('/api/finance/expenses', authenticateToken, (req, res) => {
  const { category, amount, description } = req.body;

  if (!category || amount === undefined) {
    return res.status(400).json({ error: 'Category and amount are required.' });
  }

  const newExpense = {
    id: `exp_${Date.now()}`,
    category,
    amount: Number(amount),
    description: description || '',
    expenseDate: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString()
  };

  db.expenses.push(newExpense);
  saveDb();
  res.status(201).json(newExpense);
});

app.post('/api/finance/bills', authenticateToken, (req, res) => {
  const { supplierId, amount, dueDate } = req.body;

  if (!supplierId || amount === undefined || !dueDate) {
    return res.status(400).json({ error: 'Supplier ID, amount, and due date are required.' });
  }

  const supp = db.suppliers.find(s => s.id === supplierId);
  const newBill = {
    id: `bill_${Date.now()}`,
    supplierId,
    supplierName: supp ? supp.name : 'Unknown Supplier',
    amount: Number(amount),
    dueDate,
    status: 'unpaid'
  };

  db.bills.push(newBill);
  saveDb();
  res.status(201).json(newBill);
});

app.put('/api/finance/bills/:id', authenticateToken, (req, res) => {
  const bill = db.bills.find(b => b.id === req.params.id);
  if (!bill) {
    return res.status(404).json({ error: 'Bill not found.' });
  }

  const { status } = req.body;
  if (status) {
    bill.status = status;
  }

  saveDb();
  res.json(bill);
});

// ==========================================
// SETTINGS ENDPOINTS
// ==========================================
app.get('/api/settings', authenticateToken, (req, res) => {
  res.json(db.settings);
});

app.put('/api/settings', authenticateToken, (req, res) => {
  const { restaurantName, address, gstin, fssai, taxRate, currency } = req.body;

  if (restaurantName) db.settings.restaurantName = restaurantName;
  if (address) db.settings.address = address;
  if (gstin) db.settings.gstin = gstin;
  if (fssai) db.settings.fssai = fssai;
  if (taxRate !== undefined) db.settings.taxRate = Number(taxRate);
  if (currency) db.settings.currency = currency;

  saveDb();
  res.json(db.settings);
});

// ==========================================
// DASHBOARD ENDPOINTS
// ==========================================
app.get('/api/dashboard/summary', authenticateToken, (req, res) => {
  const todayStr = new Date().toISOString().split('T')[0];
  
  // Quick aggregates
  const todayOrders = db.orders.filter(o => o.status === 'completed');
  const totalRevenue = todayOrders.reduce((acc, curr) => acc + curr.total, 0);
  const totalOrdersCount = todayOrders.length;
  const averageOrderValue = totalOrdersCount > 0 ? Math.round(totalRevenue / totalOrdersCount) : 0;

  // Find low stock items count
  const lowStockCount = db.inventory.filter(inv => {
    const ing = db.ingredients.find(i => i.id === inv.ingredientId);
    return ing ? inv.currentStock < ing.minStockLevel : false;
  }).length;

  res.json({
    totalOrders: totalOrdersCount,
    totalRevenue,
    averageOrderValue,
    lowStockCount,
    topSellingItem: "Masala Dosa (18)" // Mocked calculation matching screenshot
  });
});

// ==========================================
// NOTIFICATIONS & ORCHESTRATOR ENDPOINTS
// ==========================================
app.get('/api/notifications', authenticateToken, (req, res) => {
  res.json(db.notifications || []);
});

app.post('/api/notifications/mark-all-read', authenticateToken, (req, res) => {
  if (db.notifications) {
    db.notifications.forEach(n => {
      n.status = 'read';
    });
    saveDb();
  }
  res.json({ success: true, notifications: db.notifications || [] });
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const notif = db.notifications?.find(n => n.notification_id === req.params.id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }
  notif.status = 'read';
  saveDb();
  res.json({ success: true, notification: notif });
});

app.post('/api/notifications/:id/click', authenticateToken, (req: any, res) => {
  const notif = db.notifications?.find(n => n.notification_id === req.params.id);
  if (!notif) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  // 1. Mark as read
  notif.status = 'read';
  saveDb();

  // 2. Orchestrator maps notification.type to Agent and fetches Live Structured Data
  const agent = notif.route.agent;
  const action = notif.route.action;
  let navigationTarget = 'ai_agent';
  let routeData: any = {};

  // Attach context (restaurant_id or settings values, and user_id)
  const context = {
    restaurantId: db.settings.restaurantName,
    userId: req.user?.id || 'anonymous'
  };

  switch (agent) {
    case 'inventory':
      navigationTarget = 'inventory';
      if (action === 'getLowStockItems') {
        routeData = db.inventory
          .filter(inv => {
            const ing = db.ingredients.find(i => i.id === inv.ingredientId);
            return ing ? inv.currentStock < ing.minStockLevel : false;
          })
          .map(inv => {
            const ing = db.ingredients.find(i => i.id === inv.ingredientId);
            return {
              ingredientId: inv.ingredientId,
              name: ing ? ing.name : 'Unknown',
              currentStock: inv.currentStock,
              minStockLevel: ing ? ing.minStockLevel : 0,
              unitOfMeasure: ing ? ing.unitOfMeasure : 'kg'
            };
          });
      }
      break;

    case 'sales':
      navigationTarget = 'reports'; // POS / Reports Tab
      if (action === 'getDailySalesReport') {
        const todayOrders = db.orders.filter(o => o.status === 'completed');
        const todayRev = todayOrders.reduce((sum, o) => sum + o.total, 0);
        routeData = {
          totalOrders: todayOrders.length,
          revenueToday: todayRev,
          currency: db.settings.currency,
          averageCheckSize: todayOrders.length > 0 ? Math.round(todayRev / todayOrders.length) : 0,
          reportGeneratedAt: new Date().toISOString()
        };
      }
      break;

    case 'finance':
      navigationTarget = 'finance';
      if (action === 'getFinancialStatus') {
        const unpaidBills = db.bills.filter(b => b.status === 'unpaid');
        const totalBillsAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
        const totalExpenses = db.expenses.reduce((sum, e) => sum + e.amount, 0);
        routeData = {
          unpaidBillsCount: unpaidBills.length,
          totalBillsAmount,
          totalExpenses,
          currency: db.settings.currency
        };
      }
      break;

    case 'support':
      navigationTarget = 'ai_agent';
      if (action === 'getSupportTickets') {
        routeData = {
          ticketId: notif.reference_id || 'ticket_102',
          customerName: 'Priya Nair',
          issue: 'VIP Customer Priya Nair raised a support ticket for delayed delivery.',
          status: 'Open',
          priority: 'High',
          category: 'Delivery Delays'
        };
      }
      break;

    case 'analytics':
      navigationTarget = 'reports';
      if (action === 'getAnalyticsInsights') {
        routeData = {
          busiestHours: '12:00 PM - 3:00 PM (Lunch Hour)',
          topSellingCategory: 'Mains (Masala Dosa)',
          revenueEfficiency: '92.4%',
          aiInsight: 'Consider stocking 15% more Tomatoes as demand surges on weekends.'
        };
      }
      break;

    default:
      navigationTarget = 'ai_agent';
      break;
  }

  res.json({
    success: true,
    notification: notif,
    navigationTarget,
    routeData,
    context
  });
});

// ==========================================
// CHAT / COGNITIVE AGENT API
// ==========================================
app.get('/api/chat', authenticateToken, (req, res) => {
  res.json(db.chatHistory);
});

app.post('/api/chat', authenticateToken, async (req: any, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message payload is required.' });
  }

  // Add user message to local logs
  const userMsg = {
    id: `msg_${Date.now()}_u`,
    role: 'user',
    content: message,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
  db.chatHistory.push(userMsg);

  const normalizedQuery = message.toLowerCase().trim();

  // Smart keyword matcher to attach rich attachments directly matching the screenshot triggers!
  let attachmentType: any = undefined;
  let attachmentData: any = undefined;

  const todayOrders = db.orders.filter(o => o.status === 'completed');
  const todayRev = todayOrders.reduce((sum, o) => sum + o.total, 0);
  const todayCount = todayOrders.length;
  const todayAOV = todayCount > 0 ? Math.round(todayRev / todayCount) : 0;

  if (normalizedQuery.includes('sales summary') || normalizedQuery.includes('revenue today') || normalizedQuery.includes('today\'s sales')) {
    attachmentType = 'sales_summary';
    attachmentData = {
      totalOrders: todayCount,
      totalRevenue: todayRev,
      averageOrderValue: todayAOV,
      topSellingItem: "Masala Dosa (18)"
    };
  } else if (normalizedQuery.includes('low stock') || normalizedQuery.includes('stock warning') || normalizedQuery.includes('low-stock')) {
    attachmentType = 'low_stock';
    attachmentData = db.inventory
      .filter(inv => {
        const ing = db.ingredients.find(i => i.id === inv.ingredientId);
        return ing ? inv.currentStock < ing.minStockLevel : false;
      })
      .map(inv => {
        const ing = db.ingredients.find(i => i.id === inv.ingredientId);
        return {
          name: ing ? ing.name : 'Unknown',
          stock: `${inv.currentStock} ${ing ? ing.unitOfMeasure : 'kg'}`
        };
      });
  } else if (normalizedQuery.includes('recent orders') || normalizedQuery.includes('last orders')) {
    attachmentType = 'recent_orders';
    attachmentData = db.orders.slice(-5).reverse().map(o => ({
      id: o.id,
      customer: o.customerName || 'Walk-in Guest',
      total: o.total,
      status: o.status
    }));
  }

  // Generate Agent Response (using Gemini if API key is valid, otherwise fallback)
  let agentResponseText = '';
  const geminiKey = process.env.GEMINI_API_KEY;

  if (geminiKey && geminiKey !== "MY_GEMINI_API_KEY") {
    try {
      const ai = new GoogleGenAI({
        apiKey: geminiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      // Construct rich contextual prompt
      const contextPrompt = `
You are the RestaurantOS AI Agent for 'Spice Heaven Restaurant'. 
You help managers run the restaurant by answering performance questions in a professional, concise tone.
Here is the real-time database context of the restaurant:
- Settings: ${JSON.stringify(db.settings)}
- Total Completed Orders Today: ${todayCount}
- Net Revenue Today: ₹${todayRev}
- Average Order Value Today: ₹${todayAOV}
- Menu Options: ${JSON.stringify(db.menu.map(m => ({ name: m.name, price: m.price, category: m.category })))}
- Low Stock Alerts: ${JSON.stringify(
        db.inventory
          .filter(inv => {
            const ing = db.ingredients.find(i => i.id === inv.ingredientId);
            return ing ? inv.currentStock < ing.minStockLevel : false;
          })
          .map(inv => {
            const ing = db.ingredients.find(i => i.id === inv.ingredientId);
            return { name: ing?.name, stock: inv.currentStock, min: ing?.minStockLevel, unit: ing?.unitOfMeasure };
          })
      )}

User Query: "${message}"

Write a concise and professional response. If the query asks for a sales summary or low stock items, acknowledge that you are displaying the live card/badges for them in the interface. Do not write markdown tables or lists of low stock items if they are already mapped to attachments.
`;

      // Try calling Gemini with retry and model fallback (gemini-3.5-flash -> gemini-3.1-flash-lite)
      const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite'];
      let response: any = null;
      let lastError: any = null;

      for (const modelName of modelsToTry) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            console.log(`Attempting Gemini call with model ${modelName} (Attempt ${attempt}/2)`);
            response = await ai.models.generateContent({
              model: modelName,
              contents: contextPrompt
            });
            break; // Success! Break out of the attempt loop
          } catch (err: any) {
            lastError = err;
            console.warn(`Gemini call failed with model ${modelName} on attempt ${attempt}:`, err.message || err);
            
            // For client errors (e.g. invalid arguments or authentication), do not retry
            if (err.status && err.status >= 400 && err.status < 500 && err.status !== 429) {
              break;
            }
            
            if (attempt < 2) {
              await new Promise(resolve => setTimeout(resolve, 500 * attempt));
            }
          }
        }
        if (response) {
          break; // Success! Break out of the model loop
        }
      }

      if (response) {
        agentResponseText = response.text || '';
      } else {
        throw lastError || new Error("Failed to generate content with all configured models and retries.");
      }
    } catch (err) {
      console.error('Gemini call failed, utilizing semantic fallback responder.', err);
      agentResponseText = getSemanticFallbackResponse(normalizedQuery, todayCount, todayRev, todayAOV);
    }
  } else {
    // Elegant fallback mapping
    agentResponseText = getSemanticFallbackResponse(normalizedQuery, todayCount, todayRev, todayAOV);
  }

  const agentMsg = {
    id: `msg_${Date.now()}_a`,
    role: 'assistant',
    content: agentResponseText,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    attachmentType,
    attachmentData
  };

  db.chatHistory.push(agentMsg);
  saveDb();

  res.status(201).json({
    userMessage: userMsg,
    agentMessage: agentMsg
  });
});

function getSemanticFallbackResponse(query: string, count: number, rev: number, aov: number): string {
  if (query.includes('sales summary') || query.includes('revenue today') || query.includes('today\'s sales')) {
    return "Here is today's sales summary. We are recording a very steady footfall with high average check size!";
  }
  if (query.includes('low stock') || query.includes('stock warning') || query.includes('low-stock')) {
    return "I've detected multiple inventory ingredients falling below their target minimum threshold. Please inspect the list below:";
  }
  if (query.includes('recent orders') || query.includes('last orders')) {
    return "Displaying the last 5 transactions recorded by the POS register.";
  }
  if (query.includes('hello') || query.includes('hi') || query.includes('hey')) {
    return "Hello! I am your RestaurantOS AI assistant. How can I help you manage Spice Heaven today?";
  }
  return "I've processed your query. As the Spice Heaven digital assistant, I can check your stock logs, show live financial margins, or fetch custom billing statuses. Let me know how to assist you next!";
}

// Clear chat history endpoint
app.post('/api/chat/clear', authenticateToken, (req, res) => {
  db.chatHistory = [
    {
      id: "msg_init",
      role: "assistant",
      content: "I'm your Restaurant AI Agent 🤖\nI can help you with orders, inventory, finance, customers, suppliers, reports and much more.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ];
  saveDb();
  res.json({ status: 'ok', chatHistory: db.chatHistory });
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, mount Vite as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RestaurantOS AI Server boot complete. Listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
