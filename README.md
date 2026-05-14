# Back-end DCosta Ordenhadeiras

API REST desenvolvida para gerenciamento do e-commerce DCosta Ordenhadeiras.

## Tecnologias

- Node.js
- Express
- MySQL
- JWT
- Mercado Pago
- bcrypt
- dotenv

---

## Funcionalidades

- Autenticação de usuários
- Cadastro e login
- CRUD de produtos
- CRUD de categorias
- Sistema de pedidos
- Integração com Mercado Pago
- Retry de pagamento
- Painel administrativo
- Controle de estoque
- Upload de imagens
- Histórico de pedidos

---

## Instalação

Clone o projeto:

```bash
git clone <url-do-repositorio>

Entre na pasta:

cd back-end

Instale as dependências:

npm install
Variáveis de ambiente

Crie um arquivo .env

PORT=3001

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=dcosta_ordenhadeiras

JWT_SECRET=sua_chave_jwt

MP_ACCESS_TOKEN=seu_token_mercado_pago
Rodando o projeto
npm run dev

ou

node server.js
Estrutura
src/
 ├── controllers
 ├── routes
 ├── middleware
 ├── database
 ├── uploads
 └── server.js
Endpoints principais
Auth
POST /auth/register
POST /auth/login
Produtos
GET /products
POST /products
PUT /products/:id
DELETE /products/:id
Pedidos
GET /orders
GET /orders/my
POST /orders
POST /orders/:id/retry-payment
Integração Mercado Pago

O sistema utiliza checkout transparente via Mercado Pago para geração de pagamentos.

Autor

Rodrigo Martins
