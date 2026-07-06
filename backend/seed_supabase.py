import os
import datetime
from dotenv import load_dotenv
from supabase import create_client, Client

# Load env variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "https://ohjmpsmqdacqxmadtfxi.supabase.co")
SUPABASE_KEY = os.getenv("SUPABASE_SECRET_KEY")
if not SUPABASE_KEY or SUPABASE_KEY == "your-secret-key":
    SUPABASE_KEY = os.getenv("SUPABASE_PUBLISHABLE_KEY", "sb_publishable_cxH_9CYpj5UCeU8-yGOCHw_v5Try5NH")

print(f"[SEEDER] Initializing Supabase client. URL: {SUPABASE_URL}", flush=True)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Default data arrays mapped to JSON structures matching public tables
DEFAULT_SUPPLIERS = [
    {"id": "supp_1", "name": "Greenfield Farms", "contact_name": "Rajesh Kumar", "phone": "9812345670", "email": "orders@greenfield.com", "address": "Sector 5, Agritech Zone, Hyderabad"},
    {"id": "supp_2", "name": "Krishna Dairy", "contact_name": "Gopal Krishna", "phone": "9823456781", "email": "sales@krishnadairy.com", "address": "Gachibowli, Hyderabad"},
    {"id": "supp_3", "name": "A-One Grocery Hub", "contact_name": "Amit Shah", "phone": "9834567892", "email": "amit@aonegrocery.com", "address": "Begumpet, Hyderabad"}
]

DEFAULT_INGREDIENTS = [
    {"id": "ing_1", "name": "Tomatoes", "unit_of_measure": "kg", "supplier_id": "supp_1", "min_stock_level": 10.0},
    {"id": "ing_2", "name": "Onions", "unit_of_measure": "kg", "supplier_id": "supp_1", "min_stock_level": 15.0},
    {"id": "ing_3", "name": "Paneer", "unit_of_measure": "kg", "supplier_id": "supp_2", "min_stock_level": 5.0},
    {"id": "ing_4", "name": "Refined Oil", "unit_of_measure": "liters", "supplier_id": "supp_3", "min_stock_level": 8.0},
    {"id": "ing_5", "name": "Basmati Rice", "unit_of_measure": "kg", "supplier_id": "supp_3", "min_stock_level": 20.0},
    {"id": "ing_6", "name": "Chicken Breast", "unit_of_measure": "kg", "supplier_id": "supp_3", "min_stock_level": 12.0}
]

DEFAULT_INVENTORY = [
    {"id": "inv_1", "ingredient_id": "ing_1", "current_stock": 2.5},
    {"id": "inv_2", "ingredient_id": "ing_2", "current_stock": 3.0},
    {"id": "inv_3", "ingredient_id": "ing_3", "current_stock": 1.2},
    {"id": "inv_4", "ingredient_id": "ing_4", "current_stock": 1.0},
    {"id": "inv_5", "ingredient_id": "ing_5", "current_stock": 25.0},
    {"id": "inv_6", "ingredient_id": "ing_6", "current_stock": 18.0}
]

DEFAULT_MENU = [
    {"id": "menu_1", "name": "Masala Dosa", "description": "Crispy crepe stuffed with potato mash", "price": 120.0, "category": "Mains", "is_available": True},
    {"id": "menu_2", "name": "Paneer Butter Masala", "description": "Soft paneer in rich tomato gravy", "price": 220.0, "category": "Mains", "is_available": True},
    {"id": "menu_3", "name": "Garlic Naan", "description": "Flatbread baked with garlic", "price": 40.0, "category": "Bread", "is_available": True},
    {"id": "menu_4", "name": "Butter Naan", "description": "Leavened flatbread brushed with butter", "price": 35.0, "category": "Bread", "is_available": True},
    {"id": "menu_5", "name": "Samosa", "description": "Flaky pastry shells with potato filling", "price": 50.0, "category": "Starters", "is_available": True},
    {"id": "menu_6", "name": "Filter Coffee", "description": "South Indian milk coffee", "price": 40.0, "category": "Beverages", "is_available": True},
    {"id": "menu_7", "name": "Mango Lassi", "description": "Yogurt blended with mango", "price": 80.0, "category": "Beverages", "is_available": True},
    {"id": "menu_8", "name": "Chicken Biryani", "description": "Basmati rice layered with spiced chicken", "price": 250.0, "category": "Mains", "is_available": True}
]

DEFAULT_CUSTOMERS = [
    {"id": "cust_1", "name": "Ananya Rao", "phone": "9876543210", "email": "ananya@gmail.com", "loyalty_points": 350},
    {"id": "cust_2", "name": "Vikram Malhotra", "phone": "9123456789", "email": "vikram@yahoo.com", "loyalty_points": 120},
    {"id": "cust_3", "name": "Rohan Sharma", "phone": "9345678120", "email": "rohan@gmail.com", "loyalty_points": 50}
]

DEFAULT_BILLS = [
    {"id": "bill_1", "supplier_id": "supp_1", "supplier_name": "Greenfield Farms", "amount": 4500.00, "due_date": "2026-07-20", "status": "unpaid"},
    {"id": "bill_2", "supplier_id": "supp_2", "supplier_name": "Krishna Dairy", "amount": 1850.00, "due_date": "2026-07-15", "status": "paid"},
    {"id": "bill_3", "supplier_id": "supp_3", "supplier_name": "A-One Grocery Hub", "amount": 7200.00, "due_date": "2026-07-25", "status": "unpaid"}
]

DEFAULT_EXPENSES = [
    {"id": "exp_1", "category": "Rent", "amount": 30000.00, "description": "Monthly restaurant rent payment", "expense_date": "2026-07-01"},
    {"id": "exp_2", "category": "Electricity", "amount": 8500.00, "description": "Power utility bill", "expense_date": "2026-07-05"},
    {"id": "exp_3", "category": "Salaries", "amount": 45000.00, "description": "Staff weekly payroll", "expense_date": "2026-07-06"}
]

def seed_database(force: bool = False):
    try:
        # Check if database is already seeded by checking menu table count
        print("[SEEDER] Checking table state...", flush=True)
        res = supabase.table("menu").select("id", count="exact").limit(1).execute()
        if res.count and res.count > 0 and not force:
            print("[SEEDER] Database tables are already populated. Skipping seeder.", flush=True)
            return

        print("[SEEDER] Seeding default suppliers...", flush=True)
        for s in DEFAULT_SUPPLIERS:
            supabase.table("suppliers").upsert(s).execute()

        print("[SEEDER] Seeding default ingredients...", flush=True)
        for i in DEFAULT_INGREDIENTS:
            supabase.table("ingredients").upsert(i).execute()

        print("[SEEDER] Seeding default inventory...", flush=True)
        for inv in DEFAULT_INVENTORY:
            supabase.table("inventory").upsert(inv).execute()

        print("[SEEDER] Seeding default menu...", flush=True)
        for m in DEFAULT_MENU:
            supabase.table("menu").upsert(m).execute()

        print("[SEEDER] Seeding default customers...", flush=True)
        for c in DEFAULT_CUSTOMERS:
            supabase.table("customers").upsert(c).execute()

        print("[SEEDER] Seeding default bills...", flush=True)
        for b in DEFAULT_BILLS:
            supabase.table("bills").upsert(b).execute()

        print("[SEEDER] Seeding default expenses...", flush=True)
        for e in DEFAULT_EXPENSES:
            supabase.table("expenses").upsert(e).execute()

        print("[SEEDER] Seeding orders...", flush=True)
        # Create target sales value ₹25,430
        order_1 = {
            "id": "ord_det_1", "customer_id": "cust_1", "customer_name": "Ananya Rao", 
            "user_id": "usr_fallback_1", "server_name": "AI System Gate", "status": "completed", 
            "subtotal": 200.0, "tax": 10.0, "discount": 0.0, "total": 210.0, 
            "items": [{"id": "item_1", "menu_id": "menu_1", "menu_name": "Masala Dosa", "quantity": 1, "unit_price": 120.0}, {"id": "item_2", "menu_id": "menu_7", "menu_name": "Mango Lassi", "quantity": 1, "unit_price": 80.0}],
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        supabase.table("orders").upsert(order_1).execute()
        
        remaining = 25430.0 - 210.0
        total_orders = 42
        for idx in range(2, total_orders + 1):
            sub = 550.0 if idx < 40 else remaining
            if idx == total_orders:
                sub = remaining
            tax_val = round(sub * 0.05, 2)
            tot_val = round(sub + tax_val, 2)
            remaining -= tot_val
            
            order = {
                "id": f"ord_gen_{idx}", "customer_id": None, "customer_name": "Walk-in Guest", 
                "user_id": "usr_fallback_1", "server_name": "AI System Gate", "status": "completed",
                "subtotal": sub, "tax": tax_val, "discount": 0.0, "total": tot_val,
                "items": [], "created_at": (datetime.datetime.utcnow() - datetime.timedelta(minutes=idx)).isoformat()
            }
            supabase.table("orders").upsert(order).execute()
            if remaining <= 0:
                break
                
        # Seed chat initial message
        supabase.table("chat_history").upsert({
            "id": "msg_init",
            "role": "assistant",
            "content": "I'm your Restaurant AI Agent 🤖\nI can help you with orders, inventory, finance, customers, suppliers, reports and much more.",
            "timestamp": "10:00 AM"
        }).execute()
        
        print("[SEEDER] Database seeding successfully completed over HTTPS REST API.", flush=True)
    except Exception as err:
        print(f"[SEEDER] Seeding failed. RLS might be active, or tables are not created yet in Supabase. Details: {err}", flush=True)

if __name__ == "__main__":
    import sys
    force_seed = "--force" in sys.argv
    seed_database(force=force_seed)
