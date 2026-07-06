# RestaurantOS AI — Full-Stack Multi-Agent Operating System

RestaurantOS AI is a modular, multi-agent operating system designed to run restaurant operations at scale. It features a modern, premium React-based dashboard frontend integrated with a self-healing Python FastAPI backend powered by specialized AI agents and Supabase.

---

## 📂 Project Directory Structure

```
restaurantOs/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── __init__.py
│   │   │   ├── orchestrator.py      # Core parser, intent classifier, LLM reasoner
│   │   │   ├── inventory.py         # Handles stock depletion & low-stock alerts
│   │   │   ├── sales.py             # Formulates receipts, order creation, transaction logs
│   │   │   ├── analytics.py         # Computes dashboard KPIs & Recharts financial data
│   │   │   ├── recommendation.py    # Restocking orders & pricing optimization suggests
│   │   │   ├── notification.py      # Manages read/unread statuses and critical alerts
│   │   │   ├── auth.py              # User logins, registrations, token auth & fallbacks
│   │   │   └── database_agent.py    # Database repository abstraction
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── router.py            # API routing maps mapping all frontend calls
│   │   ├── config.py                # Environment configs (JWT, Supabase, Gemini keys)
│   │   ├── logger.py                # Logging system configuration
│   │   ├── schemas.py               # Pydantic validation shapes matching React models
│   │   └── supabase_client.py       # Supabase REST client initialization
│   └── requirements.txt             # Python backend dependencies
├── src/                             # Premium React Dashboard Frontend
│   ├── components/                  # Tab interfaces (Menu, Inventory, Finance, Chat, etc.)
│   ├── contexts/                    # Session & auth context providers
│   ├── store/                       # Zustand store managers
│   └── App.tsx                      # Root UI navigator & app coordinator
├── run_supervisor.py                # Self-healing backend supervisor
├── supabase_schema.sql              # Database setup SQL bootstrappers & RLS policies
├── package.json                     # NPM build script declarations
├── vite.config.ts                   # Vite configuration (routes API proxying to port 8000)
└── .env                             # Environment variables configuration
```

---

## 🧠 Multi-Agent Architecture

The backend implements a decoupled multi-agent workflow:
1. **Orchestrator Agent**: Serves as the central interface router. It classifies user queries, delegates tasks to domain agents, compiles contextual database snapshots, and coordinates responses using Gemini.
2. **Inventory Agent**: Checks active ingredient levels, predicts replenishment sizes, and logs stock adjustments.
3. **Sales Agent**: Handles transactions, calculates taxes, discount bounds, and logs orders.
4. **Analytics Agent**: Compiles monthly expenses, profit ratios, and structures datasets for charts.
5. **Recommendation Agent**: Formulates reorder quantities and menu optimization advice.
6. **Notification Agent**: Dispatches low-stock flags and transaction updates.
7. **Authentication Agent**: Encapsulates login, registrations, and token decoding.
8. **Database Agent**: Houses SQL abstractions, ensuring no raw queries run directly.

---

## 🚀 Setup & Execution

### 1. Database Configuration (Supabase)
1. Log into your [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** tab.
3. Copy the contents of `supabase_schema.sql` from this repository and run it. This creates all tables, triggers, default values, and RLS policies.

### 2. Environment Setup
Create a `.env` file in the root of the project with the following keys:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
SUPABASE_JWKS_URL=https://your-project.supabase.co/auth/v1/.well-known/jwks.json
GEMINI_API_KEY=your-gemini-key
```

### 3. Install Dependencies
```bash
# Install frontend Node dependencies
npm install

# Install backend Python dependencies
pip install -r backend/requirements.txt
```

### 4. Running the Application
Start both services concurrently:

* **Start Backend (FastAPI)**:
  ```bash
  npm run dev:backend
  # or python run_supervisor.py
  ```
  *Boots the self-healing supervisor on port `8000`. It will automatically terminate old ports, perform preflight imports validation, and restart uvicorn on any runtime crash.*

* **Start Frontend (Vite + React)**:
  ```bash
  npm run dev
  ```
  *Starts the React client. Access the portal at **[http://localhost:5173](http://localhost:5173)**. Vite automatically proxies all `/api` calls to the FastAPI agent backend.*
