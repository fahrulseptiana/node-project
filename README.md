# Node Project

This Node.js project implements a simple REST API using the Express framework and follows the MVC (Model‑View‑Controller) design pattern. It provides basic user management with JWT authentication and an example view rendered with EJS.

## Features

* **Register** (`POST /register`) – Create a new user with a username and password.
* **Login** (`POST /login`) – Authenticate a user and return a signed JSON Web Token (JWT).
* **Protected CRUD** (`/users`) – List, create, update, and delete user records. All `/users` endpoints require a valid JWT in the `Authorization` header using the `Bearer` scheme.
* **View** (`GET /`) – Render a simple HTML page listing users using EJS.
* **Docs** (`GET /docs`) – Interactive API documentation powered by Swagger UI.

## Usage

Install dependencies and start the server:

```bash
npm install
npm start
```

The server listens on `http://localhost:3000`.
API documentation is available at `http://localhost:3000/docs`.
