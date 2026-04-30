CEDUP Project - Ache Aqui - Projeto Integrador

13/03
- Created Python venv and it's packages (FastAPI and Uvicorn)

To link the database:
- Installing collected packages on (venv): psycopg2-binary, greenlet, SQLAlchemy, sqlmodel, asyncpg (for the FastAPI Operations)
- https://medium.com/@shahpranshu27/connecting-fastapi-to-a-database-using-postgresql-and-sqlmodel-beginner-friendly-guide-52b5aabe6ac3 (Second step made on main.py)

** 16/03
- Changed to Streamlit, Pandas, sqlalquemy (Uvicorn cound't find the Schemas lol) (AI Helped here cuz too dumb lol)
- Test was a success, it found my tables with the schemas

20/03/26
 - FastAPI usage to link existing Postgre database (using psycopg)

21/03/26
 - I asked Claude to help on databse.py :v
 Added .env file to store sensitive info

25/03/26
 - Updated databse and tested /docs, connection was a success
 - Continuing the following: Post/Put/Delete ; User Authentication ; File Upload ; Filtering and Pagination
 - Created directories: Models (Pydantic models for schemas) and Routers (Endpoints for the schemas)
 - Optimized database.py to only get the DB dependecy and the pool
 - Now main.py takes care of the entry point, FastAPI app, middleware registering, import routers and pool lifespan
 - __init__.py on models and routers directories : empty files that tell Python "this folder is a package you can import from."
 - Now the 4 routers take care of importing get_db from database.py, instead of it handling it all

26/03/26
 - Creating Pydantic properties on /models
 - 3 Class Pattern per table: Base(Holds shared fields) Create(extends for POST requests), Response(Adds DB fields for GET Responses).
 - Redone the /models files because of me doing Schroedinger's Keys (SpiderMan points at FK and PK being the same lol)
    - What changed from the previous version
        Every model now reflects the real DB structure exactly. The key additions per schema:
        registers — ClientBase now requires address_id and has optional entrepreneur_id. AddressBase and EntrepreneurBase use str for CPF, CNPJ, phone and ZIP. All three tables now have Update models too.
        inventory — ProductBase now requires entrepreneur_id and optional category_id. ProductImageBase now requires product_id. All tables have Update models.
        ordering — Every table now has its FK columns: cart has product_id + client_id, orders has client_id, payments has client_id + order_id, promos has all three FKs, transactions has payment_id, and delivery now has real fields instead of being empty.
        analytics — ReviewBase now has product_id + client_id.
- Time for the GET/POST/PUT now (Changing routers dir files):
    - Updated Inventory and testing on Database

27/03/26
- Routers test solo on Inventory no good, updated the rest of the routers too (Redoing test as 1.1.1)
    - Also updated the database, forgot to add AutoIncrementing PKs and FKs (Keys hate me lol)
    - I forgot the NOW() on timestamps to auto upgrade :v (Reediting db again lol)
    - Creating /assets/images to test local uploaded images onto Uvicorn
- CRUD Test with Claude steps on POST were a success (Still gotta improve the Jason Web Token before moving on)

30/03/26
- Time for the authentication login/register process
- Installed python jose for cryptography and hashing
- auth file as the engine room(root) (User logs, gets token, gets approved, enter the place)
- Updated main.py to register the auth router - Testing new registering
    - Self note: USE bcrypt 4.0.1 ... anything above it bugs the auth stuff :v

31/03/26
- Updating main.py temporarly to get the authentication button to show up (Succesful tests!)
- Updating dependencies and registration points (Only logged clients/entrepreneurs do what they are supposed to do) (Protect Key routes with Filtering), modded auth.py and routers files updated too
    - Inventory — category/product/image writes require get_current_entrepreneur. Product PUT/DELETE also verify the entrepreneur owns that specific product before allowing changes.
    - Ordering — cart, orders, payments and delivery are fully scoped to the logged-in client. GET /ordering/orders no longer returns all orders — only yours. Same for cart, payments and delivery. client_id is always taken from the token, never from the request body.
    - Registers — /clients/me replaces /clients/{id} for self-service. Clients can only edit and delete their own account. Entrepreneur PUT verifies you own that business record.
    - Analytics — reviews are public to read but require login to write. PUT/DELETE verify you wrote the review.
    - New endpoint — POST /auth/register/entrepreneur lets a logged-in client register their business in one step.

01/04/26
- Filtering and pagination time!
    - Products — the richest filter set since it's the core of your marketplace. Search hits both product_name AND description at once using OR. Price range uses >= and <= so you can set just one side (min_price=50 alone works fine).
    - Orders/Payments — scoped to the logged-in client first, then filtered. A client can never see another client's orders even if they guess the right filters.
    - Promos — public, filterable by status, category and product. The frontend can use status=true to show only active promos.
    - Reviews — has one bonus field in the response: avg_rating. When the frontend loads a product page it can hit /analytics/reviews?product_id=1 and get both the review list AND the average rating in one request.

- Cloudinary registration and code modded to upload product images
    - The flow will be: frontend picks a file → sends it to your API → API uploads to Cloudinary → gets back a URL → saves that URL to product_images table → returns the full image record.
- Creation of upload.py for the images (Cloudinary engine at root)
    - upload.py — the Cloudinary engine. upload_image() takes raw bytes, uploads them organized into folders by product (acheaqui/products/{product_id}/), auto-compresses, auto-converts to WebP for browsers that support it, and caps dimensions at 1200x1200. delete_image() extracts the Cloudinary public_id from the stored URL and removes it from the cloud when you delete from the DB.
    - New endpoint — POST /inventory/products/{product_id}/upload — takes a file directly, validates type and size before touching Cloudinary, checks ownership, uploads, saves the URL to product_images and returns the full record.
    - DELETE is now smarter — it deletes from both Cloudinary AND the DB in the right order, keeping your storage clean.

07/04/26
- What are we doing? Docking! (Interestellar theme plays)

08/04/26
- For docking we use: docker login -u "username"
- docker compose up -d --build (Use -d otherwise the current terminal locks on and u need to open another one)
- Step by Step on how to do it e.e
# 1. Bump the version (follow the pattern: major.minor.patch)
#    patch = bug fix (1.0.0 → 1.0.1)
#    minor = new feature (1.0.0 → 1.1.0)
#    major = breaking change (1.0.0 → 2.0.0)

# 2. Build with new version
docker build -t yourdockerhubusername/acheaqui-api:1.0.1 .

# 3. Push new version
docker push yourdockerhubusername/acheaqui-api:1.0.1

# 4. Update latest tag
docker tag yourdockerhubusername/acheaqui-api:1.0.1 yourdockerhubusername/acheaqui-api:latest
docker push yourdockerhubusername/acheaqui-api:latest

09/04/26
- Found a Front-end Open Source to use! Here: https://github.com/CoolAssPuppy/landing-pages.git
Into modulating the frontend to hold a frontend page for our eCommerce

10/04/26
- Modded colors to a orange theme on the globals.css to try it out
- Updated example-partner.ts to our new homepage
- Updated site.ts for the whole new layout as a global config
- Updated index.ts for the page registry (Each new page added goes here)
    - I broke it's original function lol, rebuilt into something extra to be able to pull the pages
    - Fixed the 
- Modded gitignore and dockerignore
- Updated .env.local to get the connection with my API
- Created new folder at src/app -> products/ containing pages for the products initially
    What each file does
    - page.tsx runs on the server — fetches products and categories in parallel before sending HTML to the browser. The product grid arrives pre-filled, not empty. Google sees real products.
    - ProductsClient.tsx takes over on the browser — handles the search input, category dropdown, price range and pagination. Every filter change hits your GET /inventory/products endpoint with the right query params. Shows a skeleton animation while loading.
    - ProductCard.tsx is a pure display component — receives one product, shows image (or a placeholder if none uploaded yet), name, description, price in BRL format, stock count, and an "Esgotado" badge when out of stock. Clicking it will navigate to /products/{id} which we build next.

13/04/26
- Minor design issue update - Database field in Pydantic not allowing Enterprise to be optional
Changed models/registers.py and routers/auth.py
- Also changed Address to be registered after the client registers, not before as it was in the order

14/04/26
- Bruhhh Flameshot + Gemini can cook?! Modified Main page on the frontend
- Created acheaqui-preview.ts and added it to index (Eventually will replace the old main page)
- Created: login/register, store-profile and updated index for display

15/04/26
- 4 New Static pages just like before added for a later implementation (Product datil, check-out, cart, dashboard)
- Updated FEnd pages: Cart, Checkout, Dashboard. Added: Success indicating a succesful order

16/04/26
- Out of tokens again lol, welp, making dynamic pages to split projects up: cart, checkout, dashboard, login, register
- The rest will remain as static pages as of now

17/04/26
- I had an wild idea... I'll reset the frontend page, learn it from scratch, it served good as a template, but let's go with something me'ish made lol.
    - types/index.ts — TypeScript now knows the shape of every piece of data from your backend. No more guessing field names.
    - lib/auth.ts — token storage in one place. Every component that needs auth imports from here. Changing to cookies later means editing one file.
    - lib/api.ts — every single API call in one file. If your backend URL changes, you change one line. If an endpoint changes, you fix one function.
    - globals.css — your warm pastel theme applied everywhere automatically.
    - layout.tsx — Navbar and Footer now appear on every page without you adding them manually.
    - Navbar.tsx — reads localStorage on mount, shows login/logout based on auth state, has mobile menu, shows Dashboard link only to entrepreneurs.
    - page.tsx — temporary redirect to /products so the app loads something at /.
- Had an inner fight with .css files, had to fit the whole stuff into @theme lol

20/04/26
- Login page time! (Just before Tiradentes Lol) / page created at app/login/
1. Show email + password form
2. Call POST /auth/login via api.ts
3. On success → store token + user in localStorage
4. Redirect to /products (or wherever they came from)
5. On error → show the error message from the API
6. If already logged in → redirect away (no point showing login)

- Register page as well!
Step 1 — Basic info (everyone fills this)
  first_name, last_name, CPF, email, phone, birthdate, password
  → calls POST /auth/register

Step 2 — Optional entrepreneur registration
  "Deseja vender no AcheAqui?" → Yes/No choice
  If Yes → shows CNPJ + phone fields
          → calls POST /auth/register/entrepreneur
  If No  → skips straight to login redirect

- Fix onto products folder, lib folder with api files directing to localhost instead of 127.0.0.1 (Linux things...)
- Fix applied onto main.py so CORS can accept the number version of API :v

21/04/26
- Fixing API Block part 2...
next.config.ts file was directing somewhere else, redirected to localhost for now
This guy also loads Cloudinary images... essentially border patrol lol (Partially fixed haha)
- After the change above, fixing the page.tsx of login and products, because of aggresive redirects and converting products to full client-side

22/04/26
- Login/Registering works... but the tokens are not refreshing, thanks React for that and its useEffect on mount it is only working once, time to fix that, because layout.tsx is only mounting it once, by building an AuthContext to tell the navbar to refresh
    - Also updated layout to wrap up AuthContext, Navbar, Login/Success and Register pages too
    - api.ts has to be altered as well... (Otherwise I need a token authorization lol, this update at line 80 it access the optional token parameter)
    - Line 28 on login page, to pass the token directly
    - Line 75 on register page, same thing
- Page for Products id created at app! What does it do:
    -   Image gallery — shows the main image large, with clickable thumbnails below if there are multiple images. Falls back to a placeholder SVG if no images uploaded.
    - Quantity picker — + and − buttons capped at in_stock max so you can't order more than available.
    - Add to cart — if not logged in, button says "Entrar para comprar" and redirects to login. If logged in, calls POST /ordering/cart and shows a green confirmation.
    - Star picker — interactive stars for the review form, hover effect included.
    - Reviews — shows all reviews with date and stars. Form only appears when logged in — guests see a "login to review" prompt instead.
- Page for Cart has been made:
    - Enriched cart items — the cart API returns only IDs and values. We immediately fetch each product's details in parallel with Promise.all so names and images appear alongside quantities.
    - Quantity controls — +/− buttons call PUT /ordering/cart/{id} with the new quantity AND recalculated total_value. The item grays out while updating so you can't double-click.
    - Remove button — the trash icon calls DELETE /ordering/cart/{id} and removes the item from state immediately — no page reload needed.
    - Sticky order summary — the right column stays visible as you scroll through a long cart. Shows itemized breakdown and total. The "frete calculado no checkout" message sets expectations correctly.
    - Empty cart state — if cart is empty shows a friendly message with a link back to products instead of a blank page.

23/04/26
- Cart when adding a product to id shows [object Object] error... Time to fix it:
    - Changing models/ordering.py: router takes client_id from current_user automatically, but CartBase still requires it in the request body. Fix in models/ordering.py commenting the client out to fix the 422 error.
    - [object Object] fix: line 181 of page in product id to see if displays a text
- Cart has been fixed! Onto the ckeckout page:
    1. Show cart summary (what they're buying)
    2. Collect delivery address
    3. Collect payment method (Pix, Credit Card, Boleto)
    4. On confirm:
    → POST /ordering/orders    → creates the order
    → POST /ordering/payments  → creates the payment record
    → POST /ordering/delivery  → creates delivery record
    → Redirect to /success
    5. Protected — redirect to /login if not logged in
- Also created success page, where it redirects after a successful purchase
    - [object Object] haunts me (Same setError fix applied)

24/04/26
- Line 95 change on checkout to convert to a Number forcefully on checkout page, also line 115 on cart page to not sum words lol
- Line 122 on checkout as well to ensure the order total is a number
- ordering.py was the culprit, replacing key fields to enter the success screen:
    Specifically:
        OrderCreate — standalone class, no Base inheritance, no client_id
        PaymentCreate — same, no client_id, no order_id confusion
        DeliveryCreate — removed client_id, router adds it from token
        All Response models — keep client_id since DB returns it

27/04/26
- I broke checkout page because I have two handlesubmits at the same time :v Now fixed with just one present with the functions to remove the cart items after purchased.

--- Progress Check - TODO ---
Week 1 → Homepage + Store profile (visual impact)
Week 2 → Polish all pages + fix remaining buttons
Week 3 → Testing + bug fixes
Week 4 → Final deployment prep + presentation

28/04/26
- Added Dashboard for entrepreneurs only (TO ADD a enterprise registration after registering Physical person)
- Added the real homepage (src/app/page.tsx), what does it do:
    - Hero — gradient background with decorative blurred circles, search bar that redirects to /products?search=query, two CTAs, and trust indicators. The search hits your existing filter endpoint directly.
    - Categories — fetches real categories from API, maps names to emojis automatically. Falls back to 6 static categories if the API returns empty (useful when DB is fresh). Each card links to /products?category_id=X.
    - Featured products — fetches 8 available products and renders them using the same ProductCard component from the products page — consistent look, no duplicate code.
    - Entrepreneur CTA — full-width terracotta section with 3 benefit cards. Links to /register.
    - Newsletter — simple email form, shows success message after submit. Placeholder for now — connecting to a real email service (Mailchimp, Resend) is a post-delivery task.
- Creative categories annoy me lol, gonna make them fixed to avoid 500 errors happening ;-; what is being fixed:
    - Created 12 Fixed Categories on DB
    - Modified routers/inventory.py adding Admin Key to POST / inv / category

29/04/26
- Modified inventory.py in routers to remove response_model=list[CategoryResponse] from there (line 28)
    - It worked!!! Pydantic tried to validate a dict as a list — that's a type mismatch. Instead of returning a nice error it crashed with a 500 because the validation happens after the DB query succeeds, inside FastAPI's response serialization layer.
- Created Store's page file, what it does:
    - Store header — gradient banner, store avatar with emoji, verified badge when status=true, phone contact, member since date, and three stats (products count, avg rating, review count).
    - Tabs — Products and Reviews tabs switch between the two views without page reload.
    - Products tab — uses the same ProductCard component from the products page. Filtered by entrepreneur_id so only their products show.
    - Reviews tab — fetches reviews from up to 5 of their products in parallel and combines them. Shows a max of 10 reviews to avoid overwhelming the page.
- Updated ProductCard.tsx to go to the store advertiser of the product
    - Did a whole link replacement because it was composing the whole div, redirecting it to the image and name, and the see store now is split from them :D
    - Change to apply to backend and front eventually: Add a field to the Entrepreneur create a name for their store
 
30/04/26
- All stores in the website page list to add, done in api.ts Enrepreneurs List
- Page for Store's list created, what each of them do:
    - Store cards — each card shows a gradient banner, store avatar emoji, verified badge, phone number, product count and member since date. Clicking navigates to /loja/{id}.
    - Product count — fetches GET /inventory/products?entrepreneur_id=X&limit=1 for each store. We only need total from the response so limit=1 keeps it fast — one tiny request per store instead of loading all products.
    - Search — filters client-side by phone or CNPJ since the entrepreneurs list is small. No API call needed on each keystroke.
    - Empty states — if no stores exist shows a "Seja o primeiro" CTA. If search returns nothing shows a clear filter button.
    - Bottom CTA — when stores exist, a subtle "Quer ter sua loja aqui?" card at the bottom nudges new entrepreneurs to register.
    - Small tweak into /loja in Footer/Navbar components because of an "s" lol


