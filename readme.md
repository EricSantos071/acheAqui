# AcheAqui — Projeto Integrador

A marketplace platform built during the CEDUP Projeto Integrador.

Built with:

* FastAPI
* PostgreSQL
* Next.js
* Docker
* Cloudinary
* TypeScript

This README also works as a development journal documenting the project's evolution, architecture decisions, bugs, fixes, redesigns, and deployment process.

---

# 📌 Current Status

## ✅ Completed

* Authentication system
* Product & inventory system
* Cart & checkout flow
* Entrepreneur dashboards
* Store pages
* Image uploads with Cloudinary
* Dockerization
* Filtering & pagination
* JWT authorization

## 🚧 In Progress

* UI refinements
* Final testing
* Deployment polish

## 📋 Planned

* Real-time cart updates
* Email integrations
* Final production deployment
* Resend to use password recovery

---

# 🧠 Dev Log

---

# Phase 1 — Backend Foundation

## 13/03/26 — Initial Backend Setup

### Backend

* Created Python virtual environment
* Installed FastAPI and Uvicorn

### Database Connection

* Installed:

  * psycopg2-binary
  * greenlet
  * SQLAlchemy
  * sqlmodel
  * asyncpg

### References

* PostgreSQL + FastAPI integration guide:

  * [https://medium.com/@shahpranshu27/connecting-fastapi-to-a-database-using-postgresql-and-sqlmodel-beginner-friendly-guide-52b5aabe6ac3](https://medium.com/@shahpranshu27/connecting-fastapi-to-a-database-using-postgresql-and-sqlmodel-beginner-friendly-guide-52b5aabe6ac3)

---

## 16/03/26 — Streamlit Experiment

### Changes

* Switched temporarily to:

  * Streamlit
  * Pandas
  * SQLAlchemy

> Uvicorn couldn't find the schemas lol

### Results

* Database schema detection worked successfully
* Tables loaded correctly

---

## 20/03/26 — PostgreSQL Integration

### Backend

* FastAPI successfully connected to the existing PostgreSQL database using psycopg

---

## 21/03/26 — Environment & Database Improvements

### Improvements

* Added `.env` support for sensitive variables
* Refactored `database.py`

> Claude helped on `database.py` :v

---

## 25/03/26 — Router & Model Structure

### Backend

* Tested `/docs` successfully
* Connection confirmed working

### Planned Features

* POST / PUT / DELETE
* User authentication
* File uploads
* Filtering & pagination

### New Structure

Created:

* `/models` → Pydantic schemas
* `/routers` → API endpoints

### Refactors

* `database.py` now only handles DB dependency and pool
* `main.py` now handles:

  * FastAPI app creation
  * middleware registration
  * router imports
  * lifespan management

### Notes

* Added `__init__.py` files so Python treats folders as packages
* Routers now import `get_db` directly instead of centralizing everything

---

## 26/03/26 — Pydantic Models & Schema Rework

### Models

* Started creating Pydantic models inside `/models`

### Pattern Used

Each table follows:

* `Base` → shared fields
* `Create` → POST requests
* `Response` → GET responses

### Major Refactor

Redid the models after fixing FK/PK confusion.

> Schroedinger's Keys moment 💀

### Database Alignment

All schemas now reflect the real database structure.

#### Registers

* `ClientBase` requires `address_id`
* Optional `entrepreneur_id`
* CPF, CNPJ, phone and ZIP converted to `str`
* Added Update models

#### Inventory

* `ProductBase` requires `entrepreneur_id`
* Optional `category_id`
* `ProductImageBase` requires `product_id`

#### Ordering

Added FK support for:

* cart
* orders
* payments
* promos
* transactions
* delivery

#### Analytics

* `ReviewBase` now includes:

  * `product_id`
  * `client_id`

### Next Step

* CRUD endpoints
* Router updates

---

## 27/03/26 — CRUD Tests & Upload Setup

### Backend

* Updated all routers after inventory tests failed
* Refactored database keys and auto increments
* Added automatic timestamps using `NOW()`

> Forgot the timestamps again :v

### Upload Tests

Created:

* `/assets/images`

### Results

* CRUD tests succeeded with Claude-assisted POST setup

### Pending

* JWT improvements

---

## 30/03/26 — Authentication System

### Authentication

* Started login/register flow
* Installed `python-jose`

### Structure

* `auth.py` became the authentication engine

### Notes

* Updated `main.py` to register auth router

> USE bcrypt 4.0.1 — newer versions break auth 😭

---

## 31/03/26 — Route Protection & Authorization

### Authentication

* Protected routes with token validation
* Added entrepreneur ownership verification

### Security Improvements

#### Inventory

* Product/category/image writes require entrepreneur authentication
* PUT/DELETE validates ownership

#### Ordering

* Orders scoped to logged-in clients only
* `client_id` always comes from token

#### Registers

* `/clients/me` replaces direct ID access
* Entrepreneurs can only edit their own business

#### Analytics

* Reviews are public to read
* Writing/editing reviews requires authentication

### New Endpoint

* `POST /auth/register/entrepreneur`

---

# Phase 2 — Marketplace Features

## 01/04/26 — Filtering, Pagination & Cloudinary

### Filtering System

#### Products

* Search supports:

  * product name
  * description
* Added price range filters

#### Orders & Payments

* Client-scoped filtering

#### Promos

* Public filtering by:

  * status
  * category
  * product

#### Reviews

* Added `avg_rating` to responses

### Cloudinary Integration

Implemented image upload flow:

1. Frontend uploads image
2. API uploads to Cloudinary
3. URL stored in DB
4. Full image record returned

### Upload System

Created `upload.py`

Features:

* Product-based folders
* WebP optimization
* Compression
* Dimension limiting
* Smart deletion syncing DB + Cloudinary

### New Endpoint

* `POST /inventory/products/{product_id}/upload`

---

## 07/04/26 — Docker Time

> Interstellar docking theme starts playing 🚀

---

## 08/04/26 — Docker Workflow

### Docker Commands

```bash
# Login
docker login -u "username"

# Build & run
docker compose up -d --build
```

### Versioning Notes

```bash
# patch = bug fix
# minor = new feature
# major = breaking change

# Build
docker build -t yourdockerhubusername/acheaqui-api:1.0.1 .

# Push
docker push yourdockerhubusername/acheaqui-api:1.0.1

# Latest tag
docker tag yourdockerhubusername/acheaqui-api:1.0.1 yourdockerhubusername/acheaqui-api:latest
docker push yourdockerhubusername/acheaqui-api:latest
```

---

# Phase 3 — Frontend Rebuild

## 09/04/26 — Frontend Base

### Frontend

* Found an open-source frontend base:

  * [https://github.com/CoolAssPuppy/landing-pages.git](https://github.com/CoolAssPuppy/landing-pages.git)

### Goal

Adapt the template into the AcheAqui marketplace frontend.

---

## 10/04/26 — Frontend Customization

### UI Changes

* Switched to orange color palette
* Updated homepage layouts
* Reworked site config and registry system

### Products Page

Created:

* `page.tsx`
* `ProductsClient.tsx`
* `ProductCard.tsx`

### Features

* Server-side rendering
* Product/category fetching
* Search & filters
* Skeleton loading states
* Product stock handling
* Product detail routing

---

## 17/04/26 — Frontend Restart

> Had a wild idea... rebuild the frontend from scratch instead of relying on the template.

### Architecture

#### `types/index.ts`

* Centralized TypeScript types

#### `lib/auth.ts`

* Token management abstraction

#### `lib/api.ts`

* Centralized API layer

#### `layout.tsx`

* Shared Navbar/Footer setup

#### `Navbar.tsx`

* Dynamic auth rendering
* Mobile support
* Entrepreneur-only dashboard links

### Styling

* Reworked the global pastel theme

> Had an inner fight with CSS and @theme lol

---

# Phase 4 — Authentication & Commerce

## 20/04/26 — Login & Register Pages

### Login Flow

* Email/password login
* Token storage
* Redirect logic
* Error handling
* Auto redirect when already authenticated

### Register Flow

#### Step 1

* Basic client registration

#### Step 2

Optional entrepreneur registration:

* Store creation
* CNPJ registration
* Entrepreneur setup

### Fixes

* Fixed localhost vs 127.0.0.1 API issues
* Updated CORS handling

---

## 22/04/26 — Auth Context & Product Details

### Authentication Fixes

* Created `AuthContext`
* Navbar now refreshes auth state correctly

### Product Details Page

Features:

* Image gallery
* Quantity picker
* Add-to-cart logic
* Interactive reviews
* Login-required review forms

### Cart Page

Features:

* Parallel product fetching
* Quantity controls
* Remove item support
* Sticky order summary
* Empty cart state

---

## 23/04/26 — Checkout Flow

### Bug Fixes

* Fixed `[object Object]` cart error
* Fixed `client_id` conflicts in ordering models

### Checkout Goals

* [x] Cart summary
* [x] Delivery address
* [x] Payment methods
* [x] Order/payment/delivery creation
* [x] Success page redirect

### Success Page

* Added successful purchase page

> `[object Object]` keeps haunting me

---

## 27/04/26 — Checkout Fixes

### Fixes

* Removed duplicate `handleSubmit`
* Added automatic cart cleanup after purchase

---

# 📊 Progress Check

## Week 1

* Homepage
* Store profile

## Week 2

* UI polish
* Button fixes

## Week 3

* Testing
* Bug fixing

## Week 4

* Deployment prep
* Presentation

---

# Phase 5 — Stores & Dashboard

## 28/04/26 — Dashboard & Homepage

### Dashboard

* Entrepreneur-only dashboard added

### Homepage Features

* Hero section
* Product search
* Dynamic categories
* Featured products
* Entrepreneur CTA
* Newsletter section

### Backend

* Added fixed categories in DB
* Added admin protection for category creation

---

## 29/04/26 — Store Pages

### Fixes

* Fixed response model mismatch causing 500 errors

### Store Page Features

* Store banners
* Product/review tabs
* Review aggregation
* Product linking improvements

### Backend Changes

* Added `store_name` support

---

## 30/04/26 — Stores Listing

### Features

* Store cards
* Search system
* Empty states
* Product counts
* Entrepreneur CTA

### Improvements

* Added `store_name` DB support
* Updated auth/register logic

---

## 06/05/26 — Store Customization

### Input Masks

Created:

* `lib/masks.ts`

### Store Visual Customization

Stores can now have:

* Profile pictures
* Custom banners
* Preset backgrounds

### Dashboard Updates

* Added save/edit support
* Added upload functionality

### Product Images

* Product images now appear across multiple pages consistently

---

## 07/05/26 — Major Fixes

### Dashboard

* Fixed save button import issue

### Authentication

* Added token validation on startup

### Store Fixes

* Product images fixed on store pages
* Editable profile banners
* Editable profile pictures

---

## 08/05/26 — Store Editing Improvements

### Features

* Store name editable after registration
* Added update API endpoints
* Dashboard editing improvements

---

## 09/05/26 — Final Refinements (v2.0-ish 😭)

### Fixes

* Categories only showing "Todos"
* Product stock updates after purchases
* Cart product images missing
* Profile banners not rendering

### New Features

* Business registration flow after signup
* Dashboard → Store quick link
* QR code sharing support
* PDF receipt generation

> TS hates `require()` lol

---

## 12/05/26 — Analytics & Nullable Fields

### Backend Fixes

* Allowed nullable banner preset fields
* Fixed analytics review conflicts

### Privacy Update

* Reviews now show:

  * client first name
  * first letter of surname

instead of exposing full user information.

---

## 15/05/26 — Password Recovery System via Swagger

### New Features

* When the user forgets the password, send a token request to admin (me)

---

## 28/05/26 — Product Stock deduction

* Updated create_order in routers/ordering.py to decrement the product's stock, and avoid it reaching 0 with GREATEST(in_stock - %s, 0)

## 03/06/26

* Modding some presentation trough Ngrok and Tailscale
changed local enviroment and configs of next

## 05/06/26

* Frontend test on phone went successful
Adjusting api fetch ts (again) debugging section
CORS once again tarnishes me, after allowing the origin, it worked!!

## 12/06/26
Added a .sh executor to run the code easier in the presentation day
Got TokenBlocked lol
Somehow it worked after applying some console tests on lol (To fix buttons later on)

## 15/06/26
Fixes applied into dashboard -> HandleClearBanner function was cleaning everything

REMINDER: Go to gitignore.io


# 🎯 Final Notes

This project evolved from a backend-focused marketplace experiment into a full-stack eCommerce platform with:

* Authentication
* Store systems
* Product management
* Checkout flow
* Dashboards
* Cloud image handling
* Docker deployment
* Frontend rebuilds
* Real-world bug fixing

And probably another future rewrite somewhere down the road lol.
