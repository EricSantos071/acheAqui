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
