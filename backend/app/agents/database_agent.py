import os
import json
import datetime
from typing import List, Dict, Any, Optional
from backend.app.supabase_client import supabase
from backend.app.logger import logger

if os.getenv("VERCEL"):
    DATA_DIR = "/tmp"
    DB_FILE = "/tmp/db.json"
else:
    DATA_DIR = os.path.join(os.getcwd(), "data")
    DB_FILE = os.path.join(DATA_DIR, "db.json")

def initialize_local_db():
    """Seeds the local JSON database file if it does not already exist."""
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
        
    if not os.path.exists(DB_FILE):
        logger.info(f"[DB_AGENT] Local database file not found. Seeding default data to {DB_FILE}...")
        
        # Build initial complete mock dataset matching server.ts default structures
        default_db = {
            "settings": {
                "restaurant_name": "Spice Heaven",
                "address": "23 Green Street, Hitech City, Hyderabad - 500081",
                "gstin": "36ABCDE1234F1Z5",
                "fssai": "13620012000456",
                "tax_rate": 5.0,
                "currency": "₹"
            },
            "menu": [
                {"id": "menu_1", "name": "Masala Dosa", "description": "Crispy crepe stuffed with potato mash", "price": 120.0, "category": "Mains", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_2", "name": "Paneer Butter Masala", "description": "Soft paneer in rich tomato gravy", "price": 220.0, "category": "Mains", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_3", "name": "Garlic Naan", "description": "Flatbread baked with garlic", "price": 40.0, "category": "Bread", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_4", "name": "Butter Naan", "description": "Leavened flatbread brushed with butter", "price": 35.0, "category": "Bread", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_5", "name": "Samosa", "description": "Flaky pastry shells with potato filling", "price": 50.0, "category": "Starters", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_6", "name": "Filter Coffee", "description": "South Indian milk coffee", "price": 40.0, "category": "Beverages", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_7", "name": "Mango Lassi", "description": "Yogurt blended with mango", "price": 80.0, "category": "Beverages", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "menu_8", "name": "Chicken Biryani", "description": "Basmati rice layered with spiced chicken", "price": 250.0, "category": "Mains", "is_available": True, "created_at": datetime.datetime.utcnow().isoformat()}
            ],
            "suppliers": [
                {"id": "supp_1", "name": "Greenfield Farms", "contact_name": "Rajesh Kumar", "phone": "9812345670", "email": "orders@greenfield.com", "address": "Sector 5, Agritech Zone, Hyderabad", "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "supp_2", "name": "Krishna Dairy", "contact_name": "Gopal Krishna", "phone": "9823456781", "email": "sales@krishnadairy.com", "address": "Gachibowli, Hyderabad", "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "supp_3", "name": "A-One Grocery Hub", "contact_name": "Amit Shah", "phone": "9834567892", "email": "amit@aonegrocery.com", "address": "Begumpet, Hyderabad", "created_at": datetime.datetime.utcnow().isoformat()}
            ],
            "ingredients": [
                {"id": "ing_1", "name": "Tomatoes", "unit_of_measure": "kg", "supplier_id": "supp_1", "min_stock_level": 10.0},
                {"id": "ing_2", "name": "Onions", "unit_of_measure": "kg", "supplier_id": "supp_1", "min_stock_level": 15.0},
                {"id": "ing_3", "name": "Paneer", "unit_of_measure": "kg", "supplier_id": "supp_2", "min_stock_level": 5.0},
                {"id": "ing_4", "name": "Refined Oil", "unit_of_measure": "liters", "supplier_id": "supp_3", "min_stock_level": 8.0},
                {"id": "ing_5", "name": "Basmati Rice", "unit_of_measure": "kg", "supplier_id": "supp_3", "min_stock_level": 20.0},
                {"id": "ing_6", "name": "Chicken Breast", "unit_of_measure": "kg", "supplier_id": "supp_3", "min_stock_level": 12.0}
            ],
            "inventory": [
                {"id": "inv_1", "ingredient_id": "ing_1", "current_stock": 2.5, "last_updated": datetime.datetime.utcnow().isoformat()},
                {"id": "inv_2", "ingredient_id": "ing_2", "current_stock": 3.0, "last_updated": datetime.datetime.utcnow().isoformat()},
                {"id": "inv_3", "ingredient_id": "ing_3", "current_stock": 1.2, "last_updated": datetime.datetime.utcnow().isoformat()},
                {"id": "inv_4", "ingredient_id": "ing_4", "current_stock": 1.0, "last_updated": datetime.datetime.utcnow().isoformat()},
                {"id": "inv_5", "ingredient_id": "ing_5", "current_stock": 25.0, "last_updated": datetime.datetime.utcnow().isoformat()},
                {"id": "inv_6", "ingredient_id": "ing_6", "current_stock": 18.0, "last_updated": datetime.datetime.utcnow().isoformat()}
            ],
            "customers": [
                {"id": "cust_1", "name": "Ananya Rao", "phone": "9876543210", "email": "ananya@gmail.com", "loyalty_points": 350, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "cust_2", "name": "Vikram Malhotra", "phone": "9123456789", "email": "vikram@yahoo.com", "loyalty_points": 120, "created_at": datetime.datetime.utcnow().isoformat()},
                {"id": "cust_3", "name": "Rohan Sharma", "phone": "9345678120", "email": "rohan@gmail.com", "loyalty_points": 50, "created_at": datetime.datetime.utcnow().isoformat()}
            ],
            "orders": [],
            "bills": [
                {"id": "bill_1", "supplier_id": "supp_1", "supplier_name": "Greenfield Farms", "amount": 4500.00, "due_date": "2026-07-20", "status": "unpaid"},
                {"id": "bill_2", "supplier_id": "supp_2", "supplier_name": "Krishna Dairy", "amount": 1850.00, "due_date": "2026-07-15", "status": "paid"},
                {"id": "bill_3", "supplier_id": "supp_3", "supplier_name": "A-One Grocery Hub", "amount": 7200.00, "due_date": "2026-07-25", "status": "unpaid"}
            ],
            "expenses": [
                {"id": "exp_1", "category": "Rent", "amount": 30000.00, "description": "Monthly restaurant rent payment", "expense_date": "2026-07-01"},
                {"id": "exp_2", "category": "Electricity", "amount": 8500.00, "description": "Power utility bill", "expense_date": "2026-07-05"},
                {"id": "exp_3", "category": "Salaries", "amount": 45000.00, "description": "Staff weekly payroll", "expense_date": "2026-07-06"}
            ],
            "chat_history": [
                {
                    "id": "msg_init",
                    "role": "assistant",
                    "content": "I'm your Restaurant AI Agent 🤖\nI can help you with orders, inventory, finance, customers, suppliers, reports and much more.",
                    "timestamp": "10:00 AM"
                }
            ],
            "notifications": []
        }
        
        # Populate orders to match 25,430 summary
        order_1 = {
            "id": "ord_det_1", "customer_id": "cust_1", "customer_name": "Ananya Rao", 
            "user_id": "usr_fallback_1", "server_name": "AI System Gate", "status": "completed", 
            "subtotal": 200.0, "tax": 10.0, "discount": 0.0, "total": 210.0, 
            "items": [{"id": "item_1", "menu_id": "menu_1", "menu_name": "Masala Dosa", "quantity": 1, "unit_price": 120.0}, {"id": "item_2", "menu_id": "menu_7", "menu_name": "Mango Lassi", "quantity": 1, "unit_price": 80.0}],
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        default_db["orders"].append(order_1)
        
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
            default_db["orders"].append(order)
            if remaining <= 0:
                break
                
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(default_db, f, indent=2)

# Ensure database is bootstrapped on load
initialize_local_db()

class LocalDB:
    """Helper class containing local JSON operations."""
    @staticmethod
    def read() -> Dict[str, Any]:
        with open(DB_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def write(data: Dict[str, Any]):
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

class DatabaseAgent:
    """
    Hybrid database agent that uses Supabase with automatic local file fallbacks
    in case schema tables are not configured or connections fail.
    """
    @staticmethod
    async def get_settings() -> Dict[str, Any]:
        try:
            res = supabase.table("settings").select("*").eq("id", "default").execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Settings retrieval failed, reading locally. Detail: {e}")
        
        db = LocalDB.read()
        return db.get("settings", {})

    @staticmethod
    async def update_settings(data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = supabase.table("settings").upsert({"id": "default", **data}).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Settings update failed, updating locally. Detail: {e}")
            
        db = LocalDB.read()
        db["settings"] = {**db.get("settings", {}), **data}
        LocalDB.write(db)
        return db["settings"]

    @staticmethod
    async def get_menu(search: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            query = supabase.table("menu").select("*")
            if search:
                query = query.ilike("name", f"%{search}%")
            res = query.execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Menu retrieval failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        menu_list = db.get("menu", [])
        if search:
            menu_list = [item for item in menu_list if search.lower() in item["name"].lower()]
        return menu_list

    @staticmethod
    async def get_menu_item(menu_id: str) -> Optional[Dict[str, Any]]:
        try:
            res = supabase.table("menu").select("*").eq("id", menu_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Menu item lookup failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        for item in db.get("menu", []):
            if item["id"] == menu_id:
                return item
        return None

    @staticmethod
    async def update_menu_item(menu_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = supabase.table("menu").update(data).eq("id", menu_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Menu item update failed, updating locally. Detail: {e}")
            
        db = LocalDB.read()
        for idx, item in enumerate(db.get("menu", [])):
            if item["id"] == menu_id:
                db["menu"][idx] = {**item, **data}
                LocalDB.write(db)
                return db["menu"][idx]
        return {}

    @staticmethod
    async def get_inventory(search: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            res = supabase.table("inventory").select("*, ingredients:ingredients(*)").execute()
            data_list = res.data or []
            
            mapped = []
            for item in data_list:
                ing = item.get("ingredients") or {}
                ing_name = ing.get("name", "Unknown Ingredient")
                if search and search.lower() not in ing_name.lower():
                    continue
                mapped.append({
                    "id": item["id"],
                    "ingredientId": item["ingredient_id"],
                    "ingredientName": ing_name,
                    "currentStock": float(item["current_stock"]),
                    "minStockLevel": float(ing.get("min_stock_level", 0.0)),
                    "unitOfMeasure": ing.get("unit_of_measure", "units")
                })
            return mapped
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Inventory retrieval failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        mapped = []
        for inv in db.get("inventory", []):
            # Resolve ingredient details
            ing = next((i for i in db.get("ingredients", []) if i["id"] == inv["ingredient_id"]), {})
            ing_name = ing.get("name", "Unknown Ingredient")
            if search and search.lower() not in ing_name.lower():
                continue
            mapped.append({
                "id": inv["id"],
                "ingredientId": inv["ingredient_id"],
                "ingredientName": ing_name,
                "currentStock": float(inv["current_stock"]),
                "minStockLevel": float(ing.get("min_stock_level", 0.0)),
                "unitOfMeasure": ing.get("unit_of_measure", "units")
            })
        return mapped

    @staticmethod
    async def adjust_inventory(ingredient_id: str, adjustment: float) -> Dict[str, Any]:
        try:
            res = supabase.table("inventory").select("*").eq("ingredient_id", ingredient_id).execute()
            if res.data:
                item = res.data[0]
                new_stock = max(0.0, float(item["current_stock"]) + adjustment)
                upd = supabase.table("inventory").update({
                    "current_stock": new_stock,
                    "last_updated": datetime.datetime.utcnow().isoformat()
                }).eq("ingredient_id", ingredient_id).execute()
                
                ing_res = supabase.table("ingredients").select("*").eq("id", ingredient_id).execute()
                ing = ing_res.data[0] if ing_res.data else {}
                return {
                    "id": item["id"],
                    "ingredientId": ingredient_id,
                    "ingredientName": ing.get("name", "Unknown"),
                    "currentStock": new_stock,
                    "minStockLevel": float(ing.get("min_stock_level", 0.0)),
                    "unitOfMeasure": ing.get("unit_of_measure", "units")
                }
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Inventory adjustment failed, executing locally. Detail: {e}")
            
        db = LocalDB.read()
        for idx, inv in enumerate(db.get("inventory", [])):
            if inv["ingredient_id"] == ingredient_id:
                new_stock = max(0.0, float(inv["current_stock"]) + adjustment)
                db["inventory"][idx]["current_stock"] = new_stock
                db["inventory"][idx]["last_updated"] = datetime.datetime.utcnow().isoformat()
                
                ing = next((i for i in db.get("ingredients", []) if i["id"] == ingredient_id), {})
                LocalDB.write(db)
                return {
                    "id": inv["id"],
                    "ingredientId": ingredient_id,
                    "ingredientName": ing.get("name", "Unknown"),
                    "currentStock": new_stock,
                    "minStockLevel": float(ing.get("min_stock_level", 0.0)),
                    "unitOfMeasure": ing.get("unit_of_measure", "units")
                }
        raise Exception("Inventory stock record not found locally.")

    @staticmethod
    async def get_suppliers(search: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            query = supabase.table("suppliers").select("*")
            if search:
                query = query.or_(f"name.ilike.%{search}%,contact_name.ilike.%{search}%")
            res = query.execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Suppliers retrieval failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        supp_list = db.get("suppliers", [])
        if search:
            supp_list = [
                s for s in supp_list 
                if search.lower() in s["name"].lower() or search.lower() in s.get("contact_name", "").lower()
            ]
        return supp_list

    @staticmethod
    async def get_customers(search: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            query = supabase.table("customers").select("*")
            if search:
                query = query.or_(f"name.ilike.%{search}%,phone.ilike.%{search}%")
            res = query.execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Customers retrieval failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        cust_list = db.get("customers", [])
        if search:
            cust_list = [
                c for c in cust_list 
                if search.lower() in c["name"].lower() or search in c["phone"]
            ]
        return cust_list

    @staticmethod
    async def add_customer(data: Dict[str, Any]) -> Dict[str, Any]:
        cust_id = f"cust_{int(datetime.datetime.utcnow().timestamp())}"
        customer_data = {
            "id": cust_id,
            "created_at": datetime.datetime.utcnow().isoformat(),
            "loyalty_points": 0,
            **data
        }
        try:
            res = supabase.table("customers").insert(customer_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Customer creation failed, inserting locally. Detail: {e}")
            
        db = LocalDB.read()
        db["customers"].append(customer_data)
        LocalDB.write(db)
        return customer_data

    @staticmethod
    async def get_orders() -> List[Dict[str, Any]]:
        try:
            res = supabase.table("orders").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Orders retrieval failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        # Sort local orders by date descending
        return sorted(db.get("orders", []), key=lambda o: o.get("created_at", ""), reverse=True)

    @staticmethod
    async def create_order(data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = supabase.table("orders").insert(data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Order registration failed, saving locally. Detail: {e}")
            
        db = LocalDB.read()
        db["orders"].append(data)
        LocalDB.write(db)
        return data

    @staticmethod
    async def get_bills() -> List[Dict[str, Any]]:
        try:
            res = supabase.table("bills").select("*").execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Bills lookup failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        return db.get("bills", [])

    @staticmethod
    async def get_expenses() -> List[Dict[str, Any]]:
        try:
            res = supabase.table("expenses").select("*").execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Expenses lookup failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        return db.get("expenses", [])

    @staticmethod
    async def get_chat_history() -> List[Dict[str, Any]]:
        try:
            res = supabase.table("chat_history").select("*").order("timestamp", desc=False).execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Chat history lookup failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        return db.get("chat_history", [])

    @staticmethod
    async def add_chat_message(msg: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = supabase.table("chat_history").insert(msg).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Chat message append failed, inserting locally. Detail: {e}")
            
        db = LocalDB.read()
        db["chat_history"].append(msg)
        LocalDB.write(db)
        return msg

    @staticmethod
    async def clear_chat_history() -> List[Dict[str, Any]]:
        default_msg = {
            "id": "msg_init",
            "role": "assistant",
            "content": "I'm your Restaurant AI Agent 🤖\nI can help you with orders, inventory, finance, customers, suppliers, reports and much more.",
            "timestamp": datetime.datetime.now().strftime("%I:%M %p")
        }
        try:
            supabase.table("chat_history").delete().neq("id", "keep_empty_clause").execute()
            supabase.table("chat_history").insert(default_msg).execute()
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Chat history clearing failed, performing locally. Detail: {e}")
            
        db = LocalDB.read()
        db["chat_history"] = [default_msg]
        LocalDB.write(db)
        return [default_msg]

    @staticmethod
    async def get_notifications() -> List[Dict[str, Any]]:
        try:
            res = supabase.table("notifications").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Notifications lookup failed, reading locally. Detail: {e}")
            
        db = LocalDB.read()
        return sorted(db.get("notifications", []), key=lambda n: n.get("created_at", ""), reverse=True)

    @staticmethod
    async def mark_notifications_read() -> None:
        try:
            supabase.table("notifications").update({"status": "read"}).eq("status", "unread").execute()
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Marking notifications read failed, executing locally. Detail: {e}")
            
        db = LocalDB.read()
        for idx, notif in enumerate(db.get("notifications", [])):
            if notif["status"] == "unread":
                db["notifications"][idx]["status"] = "read"
        LocalDB.write(db)
        
    @staticmethod
    async def mark_single_notification_read(notif_id: str) -> Optional[Dict[str, Any]]:
        try:
            res = supabase.table("notifications").update({"status": "read"}).eq("notification_id", notif_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Marking single notification read failed, executing locally. Detail: {e}")
            
        db = LocalDB.read()
        for idx, notif in enumerate(db.get("notifications", [])):
            if notif["notification_id"] == notif_id:
                db["notifications"][idx]["status"] = "read"
                LocalDB.write(db)
                return db["notifications"][idx]
        return None

    @staticmethod
    async def create_menu_item(data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            res = supabase.table("menu").insert(data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Menu item creation failed, inserting locally. Detail: {e}")
            
        db = LocalDB.read()
        db["menu"].append(data)
        LocalDB.write(db)
        return data

    @staticmethod
    async def add_supplier(data: Dict[str, Any]) -> Dict[str, Any]:
        supp_id = f"supp_{int(datetime.datetime.utcnow().timestamp())}"
        supplier_data = {
            "id": supp_id,
            "created_at": datetime.datetime.utcnow().isoformat(),
            **data
        }
        try:
            res = supabase.table("suppliers").insert(supplier_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Supplier creation failed, inserting locally. Detail: {e}")
            
        db = LocalDB.read()
        db["suppliers"].append(supplier_data)
        LocalDB.write(db)
        return supplier_data

    @staticmethod
    async def add_expense(data: Dict[str, Any]) -> Dict[str, Any]:
        exp_id = f"exp_{int(datetime.datetime.utcnow().timestamp())}"
        expense_data = {
            "id": exp_id,
            "expense_date": datetime.date.today().isoformat(),
            **data
        }
        try:
            res = supabase.table("expenses").insert(expense_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Expense creation failed, inserting locally. Detail: {e}")
            
        db = LocalDB.read()
        db["expenses"].append(expense_data)
        LocalDB.write(db)
        return expense_data

    @staticmethod
    async def add_bill(data: Dict[str, Any]) -> Dict[str, Any]:
        bill_id = f"bill_{int(datetime.datetime.utcnow().timestamp())}"
        db_local = LocalDB.read()
        supp = next((s for s in db_local.get("suppliers", []) if s["id"] == data["supplierId"]), {})
        supp_name = supp.get("name", "Unknown Supplier")
        
        bill_data = {
            "id": bill_id,
            "supplier_id": data["supplierId"],
            "supplier_name": supp_name,
            "amount": float(data["amount"]),
            "due_date": data["dueDate"],
            "status": "unpaid"
        }
        try:
            supabase_data = {
                "id": bill_id,
                "supplier_id": data["supplierId"],
                "supplier_name": supp_name,
                "amount": float(data["amount"]),
                "due_date": data["dueDate"],
                "status": "unpaid"
            }
            res = supabase.table("bills").insert(supabase_data).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Bill creation failed, inserting locally. Detail: {e}")
            
        db = LocalDB.read()
        db["bills"].append(bill_data)
        LocalDB.write(db)
        return bill_data

    @staticmethod
    async def update_bill(bill_id: str, status: str) -> Dict[str, Any]:
        try:
            res = supabase.table("bills").update({"status": status}).eq("id", bill_id).execute()
            if res.data:
                return res.data[0]
        except Exception as e:
            logger.warn(f"[DB_FALLBACK] Bill update failed, updating locally. Detail: {e}")
            
        db = LocalDB.read()
        for idx, bill in enumerate(db.get("bills", [])):
            if bill["id"] == bill_id:
                db["bills"][idx]["status"] = status
                LocalDB.write(db)
                return db["bills"][idx]
        return {}
