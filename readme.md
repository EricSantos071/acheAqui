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
