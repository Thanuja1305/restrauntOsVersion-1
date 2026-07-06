import re
import json
import datetime
import uuid
from typing import Dict, Any, List, Optional
from backend.app.logger import logger
from backend.app.agents.database_agent import DatabaseAgent, LocalDB

class IngestionGatewayAgent:
    """
    Validation and classification firewall that intercepts all manual Web UI inputs
    and Voice Agent STT transcriptions, sanitizes them, runs schema validations,
    structures the payload, and hands off exclusively to the Orchestrator Agent.
    """
    FILLER_WORDS = [
        r"\buh\b", r"\blike\b", r"\byou know\b", r"\bhmm\b", r"\bah\b", 
        r"\ber\b", r"\bum\b", r"\bokay\b", r"\bbasically\b", r"\bactually\b"
    ]

    @classmethod
    def clean_speech_text(cls, text: str) -> str:
        """Removes filler words and cleans extraneous whitespaces."""
        cleaned = text.strip()
        for word_pat in cls.FILLER_WORDS:
            cleaned = re.sub(word_pat, "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned

    @classmethod
    def extract_voice_intent_and_entities(cls, text: str) -> Dict[str, Any]:
        """
        Parses transcripts deterministically using keyword heuristics as a fallback.
        Extracts entities only if explicitly mentioned in the speech.
        """
        cleaned = cls.clean_speech_text(text).lower()
        
        # 1. Intent Classification
        intent = "analytics_query"  # Default fallback
        confidence = 0.75
        
        if any(w in cleaned for w in ["sell", "order", "buy", "checkout", "sale", "customer ordered"]):
            intent = "sales_entry"
        elif any(w in cleaned for w in ["stock", "inventory", "ingredient", "adjust", "restock", "count"]):
            intent = "inventory_update"
        elif any(w in cleaned for w in ["expense", "bill", "rent", "salary", "pay", "spend"]):
            intent = "finance_entry"
        elif any(w in cleaned for w in ["complain", "issue", "ticket", "help", "support", "broken"]):
            intent = "support_ticket"
        elif any(w in cleaned for w in ["dish", "menu", "recipe", "price of", "add dish"]):
            intent = "menu_update"
        elif any(w in cleaned for w in ["vip", "loyalty", "member", "customer name", "register guest"]):
            intent = "customer_update"
        elif any(w in cleaned for w in ["report", "analytics", "stats", "profit", "sales summary"]):
            intent = "analytics_query"

        # 2. Entity Extraction (only if explicitly present)
        entities = {}
        
        # Phone numbers
        phone_match = re.search(r"\b\d{10}\b", cleaned)
        if phone_match:
            entities["phone"] = phone_match.group(0)

        # Quantity
        qty_match = re.search(r"\b(quantity|qty|amount of|count of)?\s*(\d+)\b", cleaned)
        if qty_match:
            # Avoid matching prices or phone numbers as quantity
            num = int(qty_match.group(2))
            if num < 100 and not phone_match:
                entities["quantity"] = num

        # Prices/Amounts
        price_match = re.search(r"(rs|\brs\b|rupees|₹)\s*(\d+(\.\d+)?)", cleaned)
        if price_match:
            entities["price"] = float(price_match.group(2))
        else:
            # Secondary check for currency digits
            amt_match = re.search(r"\b(\d+)\s*(rupees|rs|bucks)\b", cleaned)
            if amt_match:
                entities["price"] = float(amt_match.group(1))

        # Payment Method
        if "cash" in cleaned:
            entities["payment_method"] = "cash"
        elif any(w in cleaned for w in ["card", "upi", "gpay", "online"]):
            entities["payment_method"] = "card"

        # Time/Date mentions
        date_keywords = ["today", "yesterday", "tomorrow", "july", "weekly", "monthly"]
        for kw in date_keywords:
            if kw in cleaned:
                entities["time_date"] = kw
                break

        # Explicit name extraction (e.g. "named shivani" or "customer shivani")
        name_match = re.search(r"(named|guest|customer|supplier|user)\s+([a-zA-Z]+)", cleaned)
        if name_match:
            entities["name"] = name_match.group(2).title()

        return {
            "intent": intent,
            "entities": entities,
            "confidence": confidence
        }

    @classmethod
    def validate_and_structure_event(cls, source: str, event_type: str, data: Dict[str, Any], confidence: float = 1.0) -> Dict[str, Any]:
        """
        Applies unified validation logic. Rejects if fields are ambiguous, or numeric values are absent.
        """
        missing_fields = []
        
        # Validation checks based on exact class types
        if event_type == "sales_entry":
            # Requires items (with quantity), or price/amount
            if "items" not in data and "product" not in data:
                missing_fields.append("product")
            if "quantity" not in data and "items" not in data:
                missing_fields.append("quantity")
            if "payment_method" not in data and "paymentMethod" not in data:
                missing_fields.append("payment_method")
                
        elif event_type == "inventory_update":
            # Requires ingredientId / product, and adjustment / quantity
            if "ingredientId" not in data and "product" not in data:
                missing_fields.append("product")
            if "adjustment" not in data and "quantity" not in data:
                missing_fields.append("quantity")
                
        elif event_type == "finance_entry":
            # Requires amount, category
            if "amount" not in data or float(data.get("amount", 0.0)) <= 0:
                missing_fields.append("amount")
            if "category" not in data:
                missing_fields.append("category")
                
        elif event_type == "menu_update":
            # Requires name, price
            if "name" not in data:
                missing_fields.append("name")
            if "price" not in data or float(data.get("price", 0.0)) <= 0:
                missing_fields.append("price")
                
        elif event_type == "customer_update":
            # Requires name, phone
            if "name" not in data:
                missing_fields.append("name")
            if "phone" not in data:
                missing_fields.append("phone")
                
        elif event_type == "support_ticket":
            # Requires description / message
            if "description" not in data and "message" not in data:
                missing_fields.append("description")

        if missing_fields:
            return {
                "status": "needs_clarification",
                "missing_fields": missing_fields,
                "message": f"Ask user for missing required details: {', '.join(missing_fields)}"
            }

        # Structure routing rules
        route_mapping = {
            "sales_entry": "sales_agent",
            "inventory_update": "inventory_agent",
            "finance_entry": "finance_agent",
            "support_ticket": "support_agent",
            "menu_update": "menu_agent",
            "customer_update": "customer_agent",
            "analytics_query": "analytics_agent"
        }

        route_to = route_mapping.get(event_type, "orchestrator_review")

        # Compile structured response
        return {
            "status": "valid",
            "type": event_type,
            "data": data,
            "confidence": confidence,
            "route_to": route_to,
            "source": source,
            "timestamp": datetime.datetime.utcnow().isoformat()
        }

    @classmethod
    async def log_event_sourcing(cls, event_payload: Dict[str, Any]) -> None:
        """Saves a Stripe-level auditable transaction log in the database."""
        log_entry = {
            "id": f"evt_{int(datetime.datetime.utcnow().timestamp())}_{uuid.uuid4().hex[:6]}",
            "event_id": event_payload.get("event_id"),
            "source": event_payload.get("source"),
            "route_to": event_payload.get("route_to"),
            "confidence": event_payload.get("confidence"),
            "payload": json.dumps(event_payload.get("payload", {})),
            "created_at": datetime.datetime.utcnow().isoformat()
        }
        
        # 1. Try logging to Supabase audit log table
        try:
            supabase.table("event_logs").insert(log_entry).execute()
        except Exception as e:
            logger.warn(f"[INGESTION_AUDIT] Supabase logging failed, saving locally. Info: {e}")
            
        # 2. Local JSON append fallback
        try:
            db = LocalDB.read()
            if "event_logs" not in db:
                db["event_logs"] = []
            db["event_logs"].append(log_entry)
            LocalDB.write(db)
        except Exception as err:
            logger.error(f"[INGESTION_AUDIT] Local logging failed: {err}")

    @classmethod
    async def ingest_input(cls, source: str, raw_data: Dict[str, Any], memory_context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        The main ingestion entrance.
        Accepts source ('web' or 'voice'), cleans transcripts, validates schemas,
        and constructs the orchestrator handoff envelope.
        """
        event_type = None
        data_payload = {}
        confidence = 1.0

        if source == "voice":
            raw_text = raw_data.get("speech_text", "")
            if not raw_text:
                return {
                    "status": "needs_clarification",
                    "missing_fields": ["speech_text"],
                    "message": "Voice transcription transcript was empty."
                }
            
            # Clean and parse voice intent
            parsed = cls.extract_voice_intent_and_entities(raw_text)
            event_type = parsed["intent"]
            data_payload = parsed["entities"]
            confidence = parsed["confidence"]

            # Context Memory Enrichment
            if memory_context:
                for key, val in memory_context.items():
                    if key not in data_payload:  # Never override explicit voice inputs
                        data_payload[key] = val

        else:  # Web UI manual forms
            event_type = raw_data.get("type")
            data_payload = raw_data.get("data", {})
            confidence = 1.0  # Web inputs are verified 100% intent confident

        # Validate structured payload
        validated = cls.validate_and_structure_event(source, event_type, data_payload, confidence)
        
        if validated["status"] != "valid":
            return validated

        # Create handoff payload for Orchestrator Agent
        handoff_payload = {
            "event_id": f"event_{uuid.uuid4().hex[:12]}",
            "source": source,
            "payload": validated["data"],
            "route_to": validated["route_to"],
            "confidence": validated["confidence"]
        }

        # Log event for auditing (Stripe-level event logs)
        await cls.log_event_sourcing(handoff_payload)

        return handoff_payload
