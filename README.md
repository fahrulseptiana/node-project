# Node Project

This Node.js project implements a simple REST API using the built‑in `http` module. It demonstrates how to build a small server without external frameworks and includes complete user management with JWT authentication.

## Features

* **Register** (`POST /register`) – Create a new user with a username and password.
* **Login** (`POST /login`) – Authenticate a user and return a signed JSON Web Token (JWT).
* **Protected CRUD** (`/users`) – List, create, update, and delete user records. All `/users` endpoints require a valid JWT in the `Authorization` header using the `Bearer` scheme.

## Usage

Start the server locally with:

    npm install # optional (no external dependencies required)
    npm start

The server listens on `http://localhost:3000`. Refer to `index.js` for endpoint implementation details.
