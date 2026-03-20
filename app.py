import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, inspect

# 1. Connection data (The link on dbeaver to find your DB)
URL_DB = "postgresql://postgres:FTh1sdB@localhost:5432/postgres"
engine = create_engine(URL_DB)

st.set_page_config(page_title="Postgres Viewer", layout="wide")
st.title("🗄️ Schema Explorer PostgreSQL")

try:
    # The Inspector can see beyound the normal schema
    inspector = inspect(engine)
    
    # Lists of all Schemas
    my_schemas = ['analytics', 'inventory', 'ordering_system', 'registers']
    
    # 2. Interface: Schema selection listing
    chosen_schema = st.sidebar.selectbox("Choose a Schema:", my_schemas)

    if chosen_schema:
        # Find the tables of only the chosen schemas
        tables = inspector.get_table_names(schema=chosen_schema)
        
        if tables:
            choosen_table = st.selectbox(f"Tables in '{chosen_schema}':", tables)
            
            # 3. Reads the chosen table
            # Important: On Postgres, we use "schema"."table"
            query = f'SELECT * FROM "{chosen_schema}"."{choosen_table}" LIMIT 100'
            df = pd.read_sql(query, engine)
            
            st.write(f"Showing the data of: `{chosen_schema}.{choosen_table}`")
            st.dataframe(df, use_container_width=True)
        else:
            st.warning(f"No table was found on schema '{chosen_schema}'.")

except Exception as e:
    st.error(f"Connection Error: {e}")

