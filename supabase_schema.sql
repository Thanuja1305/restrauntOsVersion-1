-- RestaurantOS AI - Supabase Database Schema Bootstrapper
-- Expose public tables with RLS and schema mapping matching React types.ts

-- 1. PROFILES (Linked to Supabase Auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT CHECK (role IN ('owner', 'manager', 'staff')) DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to automatically create a profile when a user registers via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, first_name, last_name, role, is_active)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'firstName', 'First'),
        COALESCE(new.raw_user_meta_data->>'lastName', 'Last'),
        COALESCE(new.raw_user_meta_data->>'role', 'staff'),
        TRUE
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    restaurant_name TEXT NOT NULL DEFAULT 'Spice Heaven',
    address TEXT NOT NULL,
    gstin TEXT,
    fssai TEXT,
    tax_rate NUMERIC(5, 2) DEFAULT 5.0,
    currency TEXT DEFAULT '₹'
);

-- 3. CUSTOMERS
CREATE TABLE IF NOT EXISTS public.customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    loyalty_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL,
    category TEXT NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUPPLIERS
CREATE TABLE IF NOT EXISTS public.suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_name TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INGREDIENTS
CREATE TABLE IF NOT EXISTS public.ingredients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    unit_of_measure TEXT NOT NULL,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
    min_stock_level NUMERIC(10, 2) DEFAULT 10.0
);

-- 7. INVENTORY ITEMS
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    ingredient_id TEXT REFERENCES public.ingredients(id) ON DELETE CASCADE UNIQUE,
    current_stock NUMERIC(10, 2) DEFAULT 0.0,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDERS
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES public.customers(id) ON DELETE SET NULL,
    customer_name TEXT,
    user_id TEXT, -- References profile ID or Supabase User ID
    server_name TEXT,
    status TEXT CHECK (status IN ('pending', 'preparing', 'completed', 'cancelled')) DEFAULT 'pending',
    subtotal NUMERIC(10, 2) DEFAULT 0.0,
    tax NUMERIC(10, 2) DEFAULT 0.0,
    discount NUMERIC(10, 2) DEFAULT 0.0,
    total NUMERIC(10, 2) DEFAULT 0.0,
    items JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PAYMENTS
CREATE TABLE IF NOT EXISTS public.payments (
    id TEXT PRIMARY KEY,
    order_id TEXT REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_method TEXT CHECK (payment_method IN ('cash', 'card', 'upi')),
    status TEXT CHECK (status IN ('completed', 'refunded', 'failed')),
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EXPENSES
CREATE TABLE IF NOT EXISTS public.expenses (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    description TEXT,
    expense_date TEXT NOT NULL
);

-- 11. BILLS
CREATE TABLE IF NOT EXISTS public.bills (
    id TEXT PRIMARY KEY,
    supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE CASCADE,
    supplier_name TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    due_date TEXT NOT NULL,
    status TEXT CHECK (status IN ('unpaid', 'paid')) DEFAULT 'unpaid'
);

-- 12. CHAT HISTORY
CREATE TABLE IF NOT EXISTS public.chat_history (
    id TEXT PRIMARY KEY,
    user_id TEXT, -- Filter history per user
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    attachment_type TEXT,
    attachment_data JSONB DEFAULT NULL
);

-- 13. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    notification_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT CHECK (status IN ('unread', 'read')) DEFAULT 'unread',
    reference_id TEXT,
    route JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. EVENT LOGS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.event_logs (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    source TEXT NOT NULL,
    route_to TEXT NOT NULL,
    confidence DOUBLE PRECISION,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES & PERMISSIONS
-- ====================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_logs ENABLE ROW LEVEL SECURITY;

-- Grant broad SELECT/INSERT/UPDATE permissions to authenticated users (and anon for playground simplicity)
-- This allows our FastAPI server backend (acting on behalf of authenticated app sessions) to perform queries.
-- For production environments, tighten the policies utilizing role permissions in raw_app_meta_data.

CREATE POLICY "Allow public read menu" ON public.menu FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow modification menu" ON public.menu FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow access profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access settings" ON public.settings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access customers" ON public.customers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access suppliers" ON public.suppliers FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access ingredients" ON public.ingredients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access inventory" ON public.inventory FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access orders" ON public.orders FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access payments" ON public.payments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access expenses" ON public.expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access bills" ON public.bills FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access chat_history" ON public.chat_history FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access notifications" ON public.notifications FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow access event_logs" ON public.event_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert Default Settings
INSERT INTO public.settings (id, restaurant_name, address, gstin, fssai, tax_rate, currency)
VALUES ('default', 'Spice Heaven', '23 Green Street, Hitech City, Hyderabad - 500081', '36ABCDE1234F1Z5', '13620012000456', 5.00, '₹')
ON CONFLICT (id) DO NOTHING;
