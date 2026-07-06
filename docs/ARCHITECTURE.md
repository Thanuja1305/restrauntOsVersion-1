# RestaurantOS AI: Enterprise System Architecture Specification
**Document Version:** 1.0.0 (Foundation Core)  
**Author:** Principal Software Architect, Google SaaS Platforms  
**Classification:** Technical Architecture Design Document (TADD)

---

## 1. Executive Summary & Design Philosophy
RestaurantOS AI is designed as an enterprise-grade, high-availability SaaS platform that serves as the digital foundation of modern food-service operations. 

While designated as **Version 1 (Foundation)**, the architecture strictly adheres to **Modular Monolith** and **Clean Architecture** patterns. This ensures that as the system scales to support future AI Orchestration, Multi-Agent Swarms, and Real-time Voice and OCR pipelines (Versions 2, 3, and 4), the core domain layers remain completely insulated and undisturbed.

### Core Architectural Axioms
1. **Strict Decoupling (Bounded Contexts):** Each functional business module (e.g., Inventory, Orders, Finance) acts as an independent domain within the monolith, maintaining its own database entities, business services, and clean interfaces.
2. **Dependency Inversion (SOLID):** High-level business logic (Services) does not depend on low-level details (ORM, Database Drivers, External APIs). Instead, both depend on abstractions (Repository Interfaces, Port Interfaces).
3. **Single Source of Truth (SSOT):** No database tables are modified across module boundaries without explicit, audited domain-service calls or event-driven mechanisms.
4. **Extensibility for Cognitive Agents:** Version 1 establishes the structural hooks, transaction boundaries, and schemas required to host autonomous micro-agents in future versions.

---

## 2. Complete Folder Structure

Below is the exhaustive file and folder tree of the **RestaurantOS AI** codebase, fully expanded to reveal every module, source file, configuration template, and orchestration script.

```text
restaurant-os/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── README.md
├── docker/
│   ├── backend/
│   │   ├── Dockerfile
│   │   └── Dockerfile.dev
│   └── frontend/
│       ├── Dockerfile
│       └── Dockerfile.dev
├── docs/
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   └── API_SPECIFICATION.md
├── scripts/
│   ├── db-migrate.sh
│   ├── db-seed.sh
│   └── health-check.sh
├── backend/
│   ├── alembic.ini
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── __init__.py
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   └── v1/
│   │   │       ├── __init__.py
│   │   │       ├── router.py
│   │   │       ├── auth.py
│   │   │       ├── dashboard.py
│   │   │       ├── orders.py
│   │   │       ├── menu.py
│   │   │       ├── inventory.py
│   │   │       ├── customers.py
│   │   │       ├── suppliers.py
│   │   │       ├── billing.py
│   │   │       ├── finance.py
│   │   │       ├── reports.py
│   │   │       └── settings.py
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── config.py
│   │   │   ├── security.py
│   │   │   ├── exceptions.py
│   │   │   └── constants.py
│   │   ├── database/
│   │   │   ├── __init__.py
│   │   │   ├── session.py
│   │   │   └── base_class.py
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── logging.py
│   │   │   ├── cors.py
│   │   │   └── rate_limiter.py
│   │   ├── modules/
│   │   │   ├── __init__.py
│   │   │   ├── auth/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── dashboard/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── orders/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── menu/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── inventory/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── customers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── suppliers/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── billing/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── finance/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── models.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── repository.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   ├── reports/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── schemas.py
│   │   │   │   ├── service.py
│   │   │   │   └── controller.py
│   │   │   └── settings/
│   │   │       ├── __init__.py
│   │   │       ├── models.py
│   │   │       ├── schemas.py
│   │   │       ├── repository.py
│   │   │       ├── service.py
│   │   │       └── controller.py
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── datetime_helpers.py
│   │       └── math_helpers.py
│   └── tests/
│       ├── __init__.py
│       ├── conftest.py
│       ├── test_auth.py
│       ├── test_orders.py
│       └── test_inventory.py
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx
    │   │   ├── page.tsx
    │   │   ├── providers.tsx
    │   │   ├── (auth)/
    │   │   │   ├── login/
    │   │   │   │   └── page.tsx
    │   │   │   └── register/
    │   │   │       └── page.tsx
    │   │   └── (dashboard)/
    │   │       ├── layout.tsx
    │   │       ├── page.tsx
    │   │       ├── orders/
    │   │       │   └── page.tsx
    │   │       ├── menu/
    │   │       │   └── page.tsx
    │   │       ├── inventory/
    │   │       │   └── page.tsx
    │   │       ├── customers/
    │   │       │   └── page.tsx
    │   │       ├── suppliers/
    │   │       │   └── page.tsx
    │   │       ├── billing/
    │   │       │   └── page.tsx
    │   │       ├── finance/
    │   │       │   └── page.tsx
    │   │       ├── reports/
    │   │       │   └── page.tsx
    │   │       └── settings/
    │   │           └── page.tsx
    │   ├── components/
    │   │   ├── ui/
    │   │   │   ├── button.tsx
    │   │   │   ├── dialog.tsx
    │   │   │   ├── dropdown-menu.tsx
    │   │   │   ├── input.tsx
    │   │   │   ├── select.tsx
    │   │   │   ├── table.tsx
    │   │   │   └── card.tsx
    │   │   ├── layout/
    │   │   │   ├── sidebar.tsx
    │   │   │   ├── header.tsx
    │   │   │   └── footer.tsx
    │   │   └── shared/
    │   │       ├── search-bar.tsx
    │   │       ├── data-table.tsx
    │   │       └── status-badge.tsx
    │   ├── hooks/
    │   │   ├── use-auth.ts
    │   │   ├── use-debounce.ts
    │   │   └── use-toast.ts
    │   ├── lib/
    │   │   ├── api-client.ts
    │   │   └── utils.ts
    │   ├── services/
    │   │   ├── auth-service.ts
    │   │   ├── order-service.ts
    │   │   └── inventory-service.ts
    │   ├── store/
    │   │   ├── auth-store.ts
    │   │   └── ui-store.ts
    │   └── types/
    │       ├── index.ts
    │       ├── auth.ts
    │       ├── orders.ts
    │       └── inventory.ts
    └── public/
        ├── favicon.ico
        └── images/
            └── logo.svg
```

---

## 3. High-Level Folder Responsibilities & Best Practices

### Root Level
- **restaurant-os/**: Absolute root of the repository.
- **docker/**: Houses Dockerfiles for local, staging, and production environments, keeping the code directories free of deployment clutter.
- **docs/**: Architectural, database, and API specifications.
- **scripts/**: Core automation scripts for pipeline migrations, database seeding, and production health-monitoring.
- **docker-compose.yml**: Orchestrates local environments by bundling FastAPI, Next.js, and PostgreSQL containers.
- **.env.example**: Exhaustive template of all required environment configurations (secrets are omitted).

### Backend Structure (`backend/`)
- **backend/app/api/**: Consolidates version-controlled routes (`v1/`), maps standard routing paradigms, and wires endpoints directly to their sub-module controllers.
- **backend/app/core/**: Houses application-wide utilities, configuration parsers, global exceptions, constants, and cryptographic libraries (JWT authentication, Argon2 hashing).
- **backend/app/database/**: Handles SQLAlchemy DB engines, connection pooling configuration, and session lifetime helpers.
- **backend/app/middleware/**: Expresses pre- and post-processing interceptors for request logging, CORS compliance, and IP-based rate-limiting.
- **backend/app/modules/**: **The Core Business Layer.** This is where the business domain is carved into bounded contexts. It is structured such that each domain is self-contained.
- **backend/app/utils/**: Math, date, and parsing libraries that are completely independent of business rules.

### Frontend Structure (`frontend/`)
- **frontend/src/app/**: Core router structure utilizing Next.js 15 App Router conventions. Parentheses denote route groups `(auth)` and `(dashboard)` which isolate layouts and route paths cleanly.
- **frontend/src/components/**: Divided into `ui/` (primitives from shadcn/ui), `layout/` (structural, reusable frames like sidebars), and `shared/` (highly functional components like searchable data-tables).
- **frontend/src/hooks/**: Reusable React hooks representing state/logic abstractions like debouncing, notification toast management, and authentication checks.
- **frontend/src/lib/**: Houses configured API clients (Axios/Fetch with interceptors for JWT injection and error-handling) and utility functions.
- **frontend/src/services/**: Direct, stateless API communication functions utilizing `api-client.ts`. Separates data-fetching definitions from component render lifecycles.
- **frontend/src/store/**: Clientside global state management engines powered by Zustand (auth-sessions, sidebar toggles).
- **frontend/src/types/**: Strong TypeScript contract declarations mapping back to backend response schemas.

---

## 4. Module Deep-Dive: File Responsibilities

Within each sub-module of `backend/app/modules/`, files follow a strict clean-architecture separation. The structural roles are explained below:

```
[ Routes ] ──────► [ Controller ] ──────► [ Service ] ──────► [ Repository ] ──────► [ Database ]
     ▲                                       │                      │
     └────────────── Validate ───────────────┴──────── Schema ──────┴─────────────── Model
```

### Direct File Definitions (Repeated consistently across modules):

#### 1. `models.py`
- **Purpose:** Declares the SQLAlchemy Declarative models representing real PostgreSQL tables, primary keys, indexes, foreign keys, and lazy-loaded ORM relationships.
- **Used by:** `repository.py` for performing queries; Alembic for generating migrations.
- **Best Practice:** Never include business logic or frontend-specific formatting inside models. Keep them as pure relational mappings.

#### 2. `schemas.py`
- **Purpose:** Defines Pydantic validation schemas mapping client input (payloads) and backend outputs (response entities). Standardizes serialized properties, type constraints, and documentation metadata.
- **Used by:** `controller.py` for request validation; `routes.py` for OpenAPI schema compilation.
- **Best Practice:** Keep read (Out), write (In), and update (Patch) schemas strictly isolated to prevent security-sensitive properties (e.g., password hashes) from leaking.

#### 3. `repository.py`
- **Purpose:** Implements the Data Access Object (DAO) pattern. Abstractly coordinates raw database statements, transactions, pagination, and filter predicates.
- **Used by:** `service.py` (Domain Layer).
- **Best Practice:** Repositories must never coordinate business decisions (e.g., "if user role is Manager, allow invoice deletion"). They simply save, edit, read, and delete.

#### 4. `service.py`
- **Purpose:** The Domain Brain. Exclusively coordinates business workflows, cross-entity rules, transaction boundaries, and authorization validation.
- **Used by:** `controller.py` (Interface Adapters).
- **Best Practice:** Services must operate purely on domain models and Pydantic schemas. They do not know about HTTP requests, cookies, or headers.

#### 5. `controller.py`
- **Purpose:** Bridges HTTP boundaries to Domain bounds. Unpacks path params, query variables, and request contexts, passes them to service methods, and wraps outcomes in appropriate HTTP responses.
- **Used by:** `routes.py`.
- **Best Practice:** Keep controllers incredibly thin. Do not write SQL queries or complex state loops inside a controller.

#### 6. `routes.py`
- **Purpose:** Exposes and mounts standard REST API endpoints, applying security protocols (dependencies) and routing prefixes.
- **Used by:** `backend/app/api/v1/router.py`.
- **Best Practice:** Explicitly define expected response codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`) and tag routes for automatic Swagger/OpenAPI indexing.

---

## 5. Database Schema Design & Relationships

The PostgreSQL relational design is constructed for zero data redundancy, strict reference checking, and high index performance. Below is the precise Entity-Relationship layout.

```
       ┌──────────────────┐
       │      Users       │
       └────────┬─────────┘
                │ 1
                │
                │ 0..*
       ┌────────┴─────────┐
       │     Settings     │
       └──────────────────┘

       ┌──────────────────┐               ┌──────────────────┐
       │    Suppliers     │ 1       0..*  │    Purchases     │
       └────────┬─────────┴───────────────┼────────┬─────────┘
                │                         │        │
                │ 1                       │ 1      │ 1
                │                         │        │
                │ 0..*                    │ 0..*   │ 0..*
       ┌────────┴─────────┐               │        │
       │   Ingredients    │◄──────────────┘        │
       └────────┬─────────┘                        │
                │ 1                                │
                │                                  │
                │ 0..*                             │
       ┌────────┴─────────┐                        │
       │    Inventory     │                        │
       └──────────────────┘                        │
                                                   │
       ┌──────────────────┐                        │
       │       Menu       │ 1                      │
       └────────┬─────────┴───────────────┐        │
                │                         │        │
                │ 1                       │        │
                │                         │        │
                │ 0..*                    │        │
       ┌────────┴─────────┐               │        │
       │    OrderItems    │               │        │
       └────────▲─────────┘               │        │
                │ 0..*                    │        │
                │                         │        │
                │ 1                       │        │
       ┌────────┴─────────┐               │        │
       │      Orders      │               │        │
       └────────▲─────────┘               │        │
                │ 0..*                    │        │
                │                         │        │
                │ 1                       │        │
       ┌────────┴─────────┐               │        │
       │    Customers     │               │        │
       └──────────────────┘               │        │
                                          │        │
       ┌──────────────────┐               │        │
       │     Payments     │◄──────────────┘        │
       └────────▲─────────┘                        │
                │ 1                                │
                │                                  │
                │ 0..*                             │
       ┌────────┴─────────┐                        │
       │      Bills       │◄───────────────────────┘
       └────────▲─────────┘
                │ 1
                │
                │ 0..*
       ┌────────┴─────────┐
       │     Expenses     │
       └──────────────────┘
```

### Table Definitions, Keys & Constraints

#### 1. `users`
*   `id`: `UUID` (Primary Key, default: `gen_random_uuid()`)
*   `email`: `VARCHAR(255)` (Unique, Indexed, Nullable: False)
*   `hashed_password`: `VARCHAR(255)` (Nullable: False)
*   `first_name`: `VARCHAR(100)` (Nullable: False)
*   `last_name`: `VARCHAR(100)` (Nullable: False)
*   `role`: `VARCHAR(50)` (Nullable: False, e.g., 'owner', 'manager', 'staff')
*   `is_active`: `BOOLEAN` (default: `True`)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 2. `customers`
*   `id`: `UUID` (Primary Key)
*   `phone`: `VARCHAR(20)` (Unique, Indexed)
*   `name`: `VARCHAR(255)` (Nullable: False)
*   `email`: `VARCHAR(255)` (Nullable: True)
*   `loyalty_points`: `INTEGER` (default: `0`)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 3. `orders`
*   `id`: `UUID` (Primary Key)
*   `customer_id`: `UUID` (Foreign Key -> `customers.id`, Nullable: True)
*   `user_id`: `UUID` (Foreign Key -> `users.id`, Nullable: False) (Server who placed it)
*   `status`: `VARCHAR(50)` (Nullable: False, e.g., 'pending', 'preparing', 'completed', 'cancelled')
*   `subtotal`: `NUMERIC(10, 2)` (Nullable: False)
*   `tax`: `NUMERIC(10, 2)` (Nullable: False)
*   `discount`: `NUMERIC(10, 2)` (default: `0.00`)
*   `total`: `NUMERIC(10, 2)` (Nullable: False)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 4. `menu`
*   `id`: `UUID` (Primary Key)
*   `name`: `VARCHAR(255)` (Unique, Indexed, Nullable: False)
*   `description`: `TEXT` (Nullable: True)
*   `price`: `NUMERIC(10, 2)` (Nullable: False)
*   `category`: `VARCHAR(100)` (Nullable: False)
*   `is_available`: `BOOLEAN` (default: `True`)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 5. `order_items`
*   `id`: `UUID` (Primary Key)
*   `order_id`: `UUID` (Foreign Key -> `orders.id` ON DELETE CASCADE, Nullable: False)
*   `menu_id`: `UUID` (Foreign Key -> `menu.id`, Nullable: False)
*   `quantity`: `INTEGER` (Nullable: False)
*   `unit_price`: `NUMERIC(10, 2)` (Nullable: False)
*   `notes`: `TEXT` (Nullable: True)

#### 6. `suppliers`
*   `id`: `UUID` (Primary Key)
*   `name`: `VARCHAR(255)` (Nullable: False, Indexed)
*   `contact_name`: `VARCHAR(255)` (Nullable: True)
*   `phone`: `VARCHAR(50)` (Nullable: False)
*   `email`: `VARCHAR(255)` (Nullable: True)
*   `address`: `TEXT` (Nullable: True)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 7. `ingredients`
*   `id`: `UUID` (Primary Key)
*   `name`: `VARCHAR(255)` (Unique, Indexed, Nullable: False)
*   `unit_of_measure`: `VARCHAR(50)` (Nullable: False, e.g., 'kg', 'liters', 'units')
*   `supplier_id`: `UUID` (Foreign Key -> `suppliers.id`, Nullable: False)
*   `min_stock_level`: `NUMERIC(10, 2)` (Nullable: False)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 8. `inventory`
*   `id`: `UUID` (Primary Key)
*   `ingredient_id`: `UUID` (Foreign Key -> `ingredients.id` ON DELETE CASCADE, Nullable: False, Unique)
*   `current_stock`: `NUMERIC(10, 2)` (Nullable: False)
*   `last_updated`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 9. `purchases`
*   `id`: `UUID` (Primary Key)
*   `supplier_id`: `UUID` (Foreign Key -> `suppliers.id`, Nullable: False)
*   `ingredient_id`: `UUID` (Foreign Key -> `ingredients.id`, Nullable: False)
*   `quantity`: `NUMERIC(10, 2)` (Nullable: False)
*   `unit_cost`: `NUMERIC(10, 2)` (Nullable: False)
*   `total_cost`: `NUMERIC(10, 2)` (Nullable: False)
*   `received_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 10. `payments`
*   `id`: `UUID` (Primary Key)
*   `order_id`: `UUID` (Foreign Key -> `orders.id`, Nullable: False, Unique)
*   `payment_method`: `VARCHAR(50)` (Nullable: False, e.g., 'cash', 'card', 'upi')
*   `status`: `VARCHAR(50)` (Nullable: False, e.g., 'completed', 'refunded', 'failed')
*   `amount`: `NUMERIC(10, 2)` (Nullable: False)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 11. `bills`
*   `id`: `UUID` (Primary Key)
*   `supplier_id`: `UUID` (Foreign Key -> `suppliers.id`, Nullable: False)
*   `amount`: `NUMERIC(10, 2)` (Nullable: False)
*   `due_date`: `DATE` (Nullable: False)
*   `status`: `VARCHAR(50)` (Nullable: False, e.g., 'unpaid', 'partially_paid', 'paid')
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 12. `expenses`
*   `id`: `UUID` (Primary Key)
*   `bill_id`: `UUID` (Foreign Key -> `bills.id`, Nullable: True) (If expense tied to a supplier bill)
*   `category`: `VARCHAR(100)` (Nullable: False, e.g., 'utilities', 'salaries', 'rent', 'inventory')
*   `amount`: `NUMERIC(10, 2)` (Nullable: False)
*   `description`: `TEXT` (Nullable: True)
*   `expense_date`: `DATE` (Nullable: False)
*   `created_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

#### 13. `settings`
*   `id`: `UUID` (Primary Key)
*   `user_id`: `UUID` (Foreign Key -> `users.id`, Nullable: False, Unique)
*   `restaurant_name`: `VARCHAR(255)` (Nullable: False)
*   `currency`: `VARCHAR(10)` (default: 'USD')
*   `tax_rate`: `NUMERIC(5, 2)` (default: `8.25`)
*   `updated_at`: `TIMESTAMP WITH TIME ZONE` (default: `NOW()`)

---

## 6. REST API Design & Routing Structure

All API routes are prefixed by `/api/v1` to support granular API version-control. 

### /auth
-   `POST /auth/register` — Creates a new system user. Checks duplicate emails and encrypts passwords.
-   `POST /auth/login` — Verifies user credentials. Returns JWT token.
-   `POST /auth/logout` — Server-side revocation of tokens (optional token blacklisting).
-   `GET /auth/me` — Gets profile of currently authenticated user.

### /orders
-   `GET /orders` — Lists all orders. Supports search, status filtering, and cursor pagination.
-   `POST /orders` — Initiates an order. Atomically inserts to `orders` and `order_items` tables.
-   `GET /orders/{id}` — Fetches details of a specific order.
-   `PUT /orders/{id}` — Updates order status (e.g., preparing to completed).
-   `DELETE /orders/{id}` — Soft deletes/cancels a specific order.

### /inventory
-   `GET /inventory` — Lists current stock levels of ingredients. Warns if `current_stock` < `min_stock_level`.
-   `POST /inventory/adjust` — Updates stock of an ingredient (e.g., spoilage adjustment, manual count corrections).
-   `GET /inventory/ingredients` — Lists available raw ingredient definitions.
-   `POST /inventory/ingredients` — Creates a new ingredient definition.

### /customers
-   `GET /customers` — Lists loyalty members. Supports search by name/phone.
-   `POST /customers` — Registers a new customer.
-   `PUT /customers/{id}` — Updates customer data or loyalty point balances.
-   `DELETE /customers/{id}` — Removes customer database record.

### /suppliers
-   `GET /suppliers` — Lists supplier profiles.
-   `POST /suppliers` — Registers a new raw goods vendor.
-   `PUT /suppliers/{id}` — Updates vendor address, bank details, or terms.
-   `DELETE /suppliers/{id}` — Removes a supplier.

### /payments
-   `GET /payments` — Lists transaction logs. Filters by card, cash, UPI.
-   `POST /payments` — Closes an order by receiving a payment payload.
-   `GET /payments/{id}` — Detail of specific transaction receipt.
-   `POST /payments/{id}/refund` — Processes standard payment reversals.

### /dashboard
-   `GET /dashboard/summary` — Fast aggregations for today's orders count, net sales, low-stock warnings, and table activity.

### /reports
-   `GET /reports/sales` — Fetches tabular/chart data over customized date ranges (daily, weekly, monthly breakdowns).
-   `GET /reports/inventory` — Generates a report showing ingredient usage velocities and waste cost logs.

### /settings
-   `GET /settings` — Fetches global restaurant metrics, default taxes, and locale features.
-   `PUT /settings` — Modifies variables such as tax rates or operating currencies.

---

## 7. Operational & Technical Flow Diagrams

### Request Flow
```
[ User Action ]
       │
       ▼
[ Next.js 15 App (Zustand & TanStack Query) ]
       │
       │ (HTTP Fetch with JWT Authorization Header)
       ▼
[ FastAPI App Entry (main.py) ]
       │
       │ (CORS, Rate Limiter & Security Interceptor Middlewares)
       ▼
[ API Routing Router (app/api/v1/) ]
       │
       │ (Unpacks headers, handles validation via Pydantic Schemas)
       ▼
[ Controller Layer (e.g., orders/controller.py) ]
       │
       │ (Wires request payload to correct context transaction)
       ▼
[ Service Layer (e.g., orders/service.py) ]
       │
       │ (Runs core business rules, locks inventory, checks limits)
       ▼
[ Repository Layer (e.g., orders/repository.py) ]
       │
       │ (Assembles SQLAlchemy query parameters)
       ▼
[ PostgreSQL Database Engine ]
       │
       │ (Persists transaction / returns records)
       ▼
[ Pydantic Out-Schema Serialization ]
       │
       ▼
[ HTTP JSON Response Payload ]
```

### Business Feature Flow (Restaurant Owner Lifecycle)
```
[ Restaurant Owner Logged In ]
       │
       ▼
[ 1. View Dashboard Summary ] (Inspects daily revenue & inventory thresholds)
       │
       ├──► [ 2. Create/Receive Orders ] (Submits POS order; subtracts menu item ingredients)
       │         │
       │         ▼
       └──► [ 3. Track Inventory Levels ] (Identifies tomato stock is under minimum limit)
                 │
                 ▼
            [ 4. Pay Supplier Bill ] (Logs purchase order; updates inventory; issues payment)
                 │
                 ▼
            [ 5. Sync Finance Ledgers ] (Records expense item in finance table)
                 │
                 ▼
            [ 6. Generate Business Reports ] (Aggregates revenue vs expenses to show net margin)
```

### Project Dependency Direction (Anti-Circular Dependency Principle)
```
       ┌────────────────────────┐
       │   Next.js 15 Client    │
       └───────────┬────────────┘
                   │
                   │ REST API Calls (HTTP / JSON)
                   ▼
       ┌────────────────────────┐
       │  FastAPI API Gateway   │
       └───────────┬────────────┘
                   │
                   │ Controls
                   ▼
       ┌────────────────────────┐
       │   Business Modules     │
       │  (Auth, Orders, etc.)  │
       └───────────┬────────────┘
                   │
                   │ References
                   ▼
       ┌────────────────────────┐
       │    Repository Layer    │
       └───────────┬────────────┘
                   │
                   │ Writes / Reads
                   ▼
       ┌────────────────────────┐
       │   PostgreSQL Engine    │
       └────────────────────────┘
```

---

## 8. Scalability Blueprint: Versions 2, 3, and 4 (AI Integration Guide)

A common engineering trap is over-engineering Version 1 with premature SDK references (AI frameworks, orchestration bindings, vector databases). 

Our architecture prevents this trap. Version 1 remains purely deterministic, clean, and database-driven. Below is the blueprint of how RestaurantOS AI scales up to host autonomous agents **without altering a single line of core business logic or database structure built in Version 1**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        COGNITIVE ORCHESTRATION LAYER                   │
│                                                                        │
│   ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐   │
│   │   Sales Agent    │    │  Inventory Agent │    │ Analytics Agent│   │
│   └────────┬─────────┘    └────────┬─────────┘    └────────┬───────┘   │
│            │                       │                       │           │
└────────────┼───────────────────────┼───────────────────────┼───────────┘
             │                       │                       │
             ▼                       ▼                       ▼
┌────────────────────────────────────────────────────────────────────────┐
│                UNIFIED MESSAGE / EXECUTION BUS (gRPC / AMQP)           │
├────────────────────────────────────────────────────────────────────────┤
│                       CENTRAL EVENT ORCHESTRATOR                       │
└────────────────────────────┬───────────────────────────────────────────┘
                             │
                             │ Invokes Context Methods (Stateless RPC / REST)
                             ▼
┌────────────────────────────────────────────────────────────────────────┐
│                       MODULAR MONOLITH CORE (V1)                       │
│                                                                        │
│   ┌──────────────────┐    ┌──────────────────┐    ┌────────────────┐   │
│   │   Auth Module    │    │  Orders Module   │    │ Finance Module │   │
│   └──────────────────┘    └──────────────────┘    └────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Version 2: The Cognitive Read-Model Layer (AI Assistant)
- **Objective:** Add an ambient "AI Assistant" that allows users to ask questions about current performance ("What was our top seller today?", "Are we low on tomatoes?").
- **Integration Strategy:** 
  - Install a separate microservice (`copilot-engine`) that accesses the PostgreSQL database in **Read-Only** mode.
  - The `copilot-engine` parses user natural language using a Gemini-powered API. It translates these queries into standard SQL queries, or interacts with the Version 1 FastAPI REST endpoints directly using an internal system JWT token.
  - **Zero Impact on V1:** The core modules remain unchanged. The AI has zero write access and cannot corrupt transactions.

### Version 3: The Interceptor & Action Engine (Voice, OCR, and AI Actions)
- **Objective:** Support hands-free operations (Voice ordering in kitchen, OCR billing processing from paper invoices) and trigger write transactions.
- **Integration Strategy:**
  - Introduce an **Event-Driven Broker (e.g., Redis Streams / RabbitMQ)** in the system.
  - Set up **Adapter Services** (e.g., `invoice-ocr-worker` and `voice-intent-recognizer`) that process raw inputs asynchronously, output a structured JSON schema, and route it to an internal execution bus.
  - The execution bus calls the V1 Services directly (e.g., calling `OrdersService.create_order` or `BillingService.process_bill`) using Pydantic validation.
  - **Zero Impact on V1:** Voice and OCR act simply as alternative input layers. To the core business code, an order created via voice looks identical to an order created manually via the dashboard UI.

### Version 4: The Autonomous Agent Swarm (Multi-Agent Orchestration)
- **Objective:** Implement specialized micro-agents (e.g., Sales Agent, Inventory Agent, Finance Agent, Support Agent) orchestrated by a unified Coordinator.
- **Integration Strategy:**
  - Build a modular agent-based layer that abstracts specialized models behind a unified execution bus.
  - Each agent is a stateless micro-worker running in its own container, registering with a central **Service Mesh** (e.g., HashiCorp Consul / gRPC-based control plane).
  - **Inter-Agent Communication:** Handled via standard cloud events (protobufs) on a unified messaging bus.
  - **The Workflow:**
    1. **Sales Agent** predicts a rush of customer orders next weekend based on weather and historical charts.
    2. It publishes a `SalesPredictionEvent`.
    3. **Inventory Agent** consumes the prediction event, calculates ingredient shortages, and automatically generates a draft Purchase Order (PO).
    4. **Finance Agent** receives the PO invoice, evaluates real-time cash flow, runs budget calculations, and schedules a payment transaction.
    5. **Orchestrator** logs audit trails, handles failures, and prompts the manager with a "Confirm Auto-Reorder" prompt on the dashboard.
  - **Zero Impact on V1:** The agents do not bypass business rules. They communicate exclusively through the secure API layer or by publishing events that are consumed by standard V1 event listeners. The database maintains its absolute structural integrity.
