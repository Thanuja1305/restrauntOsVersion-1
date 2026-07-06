import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Body, WebSocket, WebSocketDisconnect

from backend.app import schemas
from backend.app.agents.auth import AuthAgent
from backend.app.agents.database_agent import DatabaseAgent
from backend.app.agents.sales import SalesAgent
from backend.app.agents.inventory import InventoryAgent
from backend.app.agents.analytics import AnalyticsAgent
from backend.app.agents.notification import NotificationAgent
from backend.app.agents.orchestrator import OrchestratorAgent
from backend.app.agents.ingestion_gateway import IngestionGatewayAgent

router = APIRouter(prefix="/api")

# ==========================================
# AUTH ENDPOINTS
# ==========================================
@router.post("/auth/login", response_model=schemas.LoginResponse)
async def login(payload: schemas.LoginRequest):
    return await AuthAgent.login_user(payload.email, payload.password)

@router.post("/auth/register")
async def register(payload: schemas.RegisterRequest):
    return await AuthAgent.register_user(
        payload.email, 
        payload.password, 
        payload.firstName, 
        payload.lastName, 
        payload.role
    )

@router.get("/auth/me", response_model=schemas.AuthMeResponse)
async def get_me(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return {"user": user}

# ==========================================
# SETTINGS ENDPOINTS
# ==========================================
@router.get("/settings", response_model=schemas.SettingsSchema)
async def get_settings(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_settings()

@router.put("/settings", response_model=schemas.SettingsSchema)
async def update_settings(data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.update_settings(data)

# ==========================================
# MENU ENDPOINTS
# ==========================================
@router.get("/menu", response_model=List[schemas.MenuItemSchema])
async def get_menu(search: Optional[str] = None, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_menu(search)

@router.post("/menu", response_model=schemas.MenuItemSchema)
async def create_menu_item(data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    menu_data = {
        "name": data["name"],
        "price": float(data["price"]),
        "category": data["category"],
        "is_available": data.get("isAvailable", True),
        "description": data.get("description", ""),
        "created_at": datetime.datetime.utcnow().isoformat()
    }
    menu_data["id"] = f"menu_{int(datetime.datetime.utcnow().timestamp())}"
    return await DatabaseAgent.create_menu_item(menu_data)

@router.put("/menu/{menu_id}", response_model=schemas.MenuItemSchema)
async def update_menu_item(menu_id: str, data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.update_menu_item(menu_id, data)

# ==========================================
# INVENTORY ENDPOINTS
# ==========================================
@router.get("/inventory", response_model=List[schemas.InventoryItemSchema])
async def get_inventory(search: Optional[str] = None, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await InventoryAgent.get_inventory(search)

@router.post("/inventory/adjust", response_model=schemas.InventoryItemSchema)
async def adjust_inventory(payload: schemas.StockAdjustmentRequest, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await InventoryAgent.adjust_stock(payload.ingredientId, payload.adjustment)

# ==========================================
# SUPPLIERS ENDPOINTS
# ==========================================
@router.get("/suppliers", response_model=List[schemas.SupplierSchema])
async def get_suppliers(search: Optional[str] = None, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_suppliers(search)

@router.post("/suppliers", response_model=schemas.SupplierSchema)
async def add_supplier(data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    supplier_data = {
        "name": data["name"],
        "phone": data["phone"],
        "email": data.get("email"),
        "address": data.get("address"),
        "contact_name": data.get("contactName")
    }
    return await DatabaseAgent.add_supplier(supplier_data)

# ==========================================
# CUSTOMERS ENDPOINTS
# ==========================================
@router.get("/customers", response_model=List[schemas.CustomerSchema])
async def get_customers(search: Optional[str] = None, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_customers(search)

@router.post("/customers", response_model=schemas.CustomerSchema)
async def add_customer(data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.add_customer(data)

# ==========================================
# ORDERS ENDPOINTS
# ==========================================
@router.get("/orders", response_model=List[schemas.OrderSchema])
async def get_orders(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await SalesAgent.get_orders()

@router.post("/orders", response_model=schemas.OrderSchema)
async def create_order(payload: schemas.OrderCreateRequest, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    items_dict = [item.model_dump(by_alias=True) for item in payload.items]
    return await SalesAgent.create_order(
        payload.customerId, 
        payload.customerName, 
        items_dict, 
        payload.discount, 
        user["id"]
    )

# ==========================================
# NOTIFICATIONS ENDPOINTS
# ==========================================
@router.get("/notifications", response_model=List[schemas.NotificationSchema])
async def get_notifications(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await NotificationAgent.get_notifications()

@router.post("/notifications/mark-all-read")
async def mark_all_notifications_read(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    await NotificationAgent.mark_all_read()
    return {"success": True}

@router.post("/notifications/{notif_id}/read")
async def mark_single_notification_read(notif_id: str, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    res = await NotificationAgent.mark_single_read(notif_id)
    if not res:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"success": True, "notification": res}

# ==========================================
# FINANCE ENDPOINTS
# ==========================================
@router.get("/finance", response_model=schemas.FinanceOverview)
async def get_finance_overview(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await AnalyticsAgent.get_financial_overview()

@router.get("/finance/bills", response_model=List[schemas.BillSchema])
async def get_bills(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_bills()

@router.post("/finance/bills", response_model=schemas.BillSchema)
async def add_bill(data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.add_bill(data)

@router.put("/finance/bills/{bill_id}", response_model=schemas.BillSchema)
async def update_bill(bill_id: str, data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.update_bill(bill_id, data["status"])

@router.get("/finance/expenses", response_model=List[schemas.ExpenseSchema])
async def get_expenses(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_expenses()

@router.post("/finance/expenses", response_model=schemas.ExpenseSchema)
async def add_expense(data: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    expense_data = {
        "category": data["category"],
        "amount": float(data["amount"]),
        "description": data.get("description", "")
    }
    return await DatabaseAgent.add_expense(expense_data)

# ==========================================
# CHAT ENDPOINTS
# ==========================================
@router.get("/chat", response_model=List[schemas.MessageSchema])
async def get_chat_history(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await DatabaseAgent.get_chat_history()

@router.post("/chat", response_model=schemas.ChatResponse)
async def submit_chat_message(payload: schemas.ChatRequest, user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    return await OrchestratorAgent.process_chat_query(payload.message, user["id"])

@router.post("/chat/clear", response_model=schemas.ChatClearResponse)
async def clear_chat(user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    history = await DatabaseAgent.clear_chat_history()
    return {"status": "ok", "chatHistory": history}

# ==========================================
# INGESTION ENDPOINTS
# ==========================================
@router.post("/ingestion/event")
async def ingest_event(payload: Dict[str, Any], user: Dict[str, Any] = Depends(AuthAgent.verify_token)):
    source = payload.get("source", "web")
    raw_data = payload.get("raw_data", {})
    memory_context = payload.get("memory_context")
    res = await IngestionGatewayAgent.ingest_input(source, raw_data, memory_context)
    return res

@router.websocket("/ingestion/voice-stream")
async def websocket_voice_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        await websocket.send_json({
            "status": "ready",
            "message": "Real-time streaming voice agent listener connected."
        })
        while True:
            data = await websocket.receive_json()
            speech_text = data.get("text", "")
            memory_context = data.get("memory_context")
            res = await IngestionGatewayAgent.ingest_input("voice", {"speech_text": speech_text}, memory_context)
            await websocket.send_json(res)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

# ==========================================
# ADMIN ENDPOINTS
# ==========================================
@router.post("/admin/seed")
async def trigger_seed(force: bool = False):
    from backend.seed_supabase import seed_database
    try:
        seed_database(force=force)
        return {"success": True, "message": "Database seeded successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database seeding failed: {e}")
