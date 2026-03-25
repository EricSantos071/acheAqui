CEDUP Project - Ache Aqui - Projeto Integrador

13/03
- Created Python venv and it's packages (FastAPI and Uvicorn)

To link the database:
- Installing collected packages on (venv): psycopg2-binary, greenlet, SQLAlchemy, sqlmodel, asyncpg (for the FastAPI Operations)
- https://medium.com/@shahpranshu27/connecting-fastapi-to-a-database-using-postgresql-and-sqlmodel-beginner-friendly-guide-52b5aabe6ac3 (Second step made on main.py)

** 16/03
- Changed to Streamlit, Pandas, sqlalquemy (Uvicorn cound't find the Schemas lol) (AI Helped here cuz too dumb lol)
- Test was a success, it found my tables with the schemas
- To-do: 
    1. Definir a Arquitetura de Dados (Modelagem)
Como suas tabelas já existem no Postgres, o primeiro passo no backend é mapeá-las no código. Em vez de escrever SQL puro (SELECT * FROM...), você usará o SQLAlchemy para transformar essas tabelas em Classes Python. Isso facilita muito a manutenção e evita erros de digitação.
 --> 2. Criar a Camada de API (FastAPI)
O "coração" do backend é a API. Você precisará escolher um framework (recomendo fortemente o FastAPI por ser moderno e rápido). (Gotta deal with an ORM)
	Swagger (Pra testar a API)
    Aqui você cria as "portas de entrada" (Endpoints), como /pedidos, /estoque ou /usuarios.
    O Backend recebe requisições, valida se quem pediu tem permissão e consulta o banco.

3. Implementar a Lógica de Negócio (Services)
Não deixe a lógica de cálculo (ex: calcular imposto, verificar se há estoque disponível) dentro da API ou do Banco. Crie uma camada de "Serviços". É onde o código decide o que fazer com a informação que veio do banco antes de entregá-la ao frontend.
4. Gerenciar Migrações (Alembic)
Mesmo que sua database já exista, conforme o projeto cresce, você precisará criar novas colunas ou tabelas. Usar uma ferramenta de migração permite que você altere o banco de dados via código Python, mantendo um histórico de versões (como um "Git" para o banco).
5. Autenticação e Segurança
O backend deve ser o segurança do seu projeto. Você precisará implementar:

    JWT (JSON Web Tokens): Para que o usuário faça login e o backend saiba quem ele é em cada clique.
    Hashing de senhas: Nunca salvar senhas em texto puro.

6. Validação de Dados (Pydantic)
Antes de salvar qualquer coisa no Postgres, o backend deve garantir que os dados estão no formato correto (ex: se um preço é realmente um número e não um texto).

20/03/26
 - FastAPI usage to link existing Postgre database (using psycopg)

21/03/26
 - I asked Claude to help on databse.py :v
 Added .env file to store sensitive info

25/03/26
 - Updated databse and tested /docs, connection was a success
 - Continuing the following: Post/Put/Delete ; User Authentication ; File Upload ; Filtering and Pagination

