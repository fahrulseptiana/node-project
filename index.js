/*
 * A Node.js HTTP server that implements basic user registration, login,
 * and CRUD operations protected by JSON Web Tokens (JWT). Data is stored
 * in an in-memory array rather than a database, making this server
 * suitable for demonstration purposes or small applications.
 *
 * Endpoints:
 *   POST /register - Create a new user (username and password).
 *   POST /login    - Authenticate a user and return a signed JWT.
 *   GET /users     - List all users (protected).
 *   POST /users    - Create a user record (protected).
 *   PUT /users/:id - Update an existing user (protected).
 *   DELETE /users/:id - Delete a user (protected).
 *
 * All protected endpoints require a valid JWT in the Authorization header
 * using the Bearer scheme. Tokens are signed with an HMAC secret defined
 * in this file and verified on each request.
 */

const http = require('http');
const crypto = require('crypto');
const url = require('url');

// In-memory storage for users. Each user is an object with the following shape:
// { id: number, username: string, password: string }
const users = [];
let nextUserId = 1;

// Secret used to sign and verify JWTs. In a real application, this should be
// stored securely and not hard-coded.
const JWT_SECRET = 'change_this_secret_in_production';

/**
 * Create a JWT for a given payload using HS256 (HMAC-SHA256).
 * The token consists of a base64url-encoded header, payload, and signature.
 *
 * @param {Object} payload - The payload to encode in the JWT.
 * @returns {string} The signed JWT.
 */
function generateToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const base64Header = Buffer.from(JSON.stringify(header)).toString('base64url');
  const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
  return `${base64Header}.${base64Payload}.${signature}`;
}

/**
 * Verify a JWT signed with HS256. If the signature is valid, the payload
 * is returned; otherwise, null is returned.
 *
 * @param {string} token - The JWT to verify.
 * @returns {Object|null} The decoded payload or null if verification fails.
 */
function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [base64Header, base64Payload, signature] = parts;
  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${base64Header}.${base64Payload}`)
    .digest('base64url');
  // Use timingSafeEqual to mitigate timing attacks
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }
  try {
    const payloadJson = Buffer.from(base64Payload, 'base64url').toString('utf8');
    return JSON.parse(payloadJson);
  } catch {
    return null;
  }
}

/**
 * Utility to parse the JSON body of an incoming request. Resolves with
 * an object or null if the body is not valid JSON.
 *
 * @param {http.IncomingMessage} req - The request to parse.
 * @returns {Promise<Object|null>} Parsed JSON object or null.
 */
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve(null);
        return;
      }
      try {
        const parsed = JSON.parse(data);
        resolve(parsed);
      } catch {
        resolve(null);
      }
    });
  });
}

/**
 * Send a JSON response with a given status code and object.
 *
 * @param {http.ServerResponse} res - The response object.
 * @param {number} statusCode - HTTP status code.
 * @param {Object} obj - Data to send in JSON format.
 */
function sendJson(res, statusCode, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  });
  res.end(body);
}

/**
 * Middleware-like function to authenticate a request based on the JWT
 * found in the Authorization header. Returns the decoded payload if valid;
 * otherwise returns null.
 *
 * @param {http.IncomingMessage} req - The request to authenticate.
 * @returns {Object|null} Decoded JWT payload or null.
 */
function authenticateRequest(req) {
  const authHeader = req.headers['authorization'] || '';
  const match = authHeader.match(/^Bearer\s+(.*)$/);
  if (!match) {
    return null;
  }
  const token = match[1];
  return verifyToken(token);
}

/**
 * Extract the user ID from a URL path like '/users/123'.
 *
 * @param {string} pathname - The URL pathname.
 * @returns {number|null} Parsed user ID or null if not present.
 */
function getUserIdFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 2 && parts[0] === 'users') {
    const id = parseInt(parts[1], 10);
    return Number.isNaN(id) ? null : id;
  }
  return null;
}

// Define the port and hostname.
const hostname = '127.0.0.1';
const port = 3000;

// Create the HTTP server and define request handling logic.
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url || '', true);
  const pathname = parsedUrl.pathname || '';

  // Route: POST /register - register a new user
  if (req.method === 'POST' && pathname === '/register') {
    const body = await parseJsonBody(req);
    if (!body || !body.username || !body.password) {
      return sendJson(res, 400, { error: 'Username and password are required.' });
    }
    const existing = users.find((u) => u.username === body.username);
    if (existing) {
      return sendJson(res, 409, { error: 'Username already exists.' });
    }
    const user = {
      id: nextUserId++,
      username: body.username,
      password: body.password,
    };
    users.push(user);
    return sendJson(res, 201, { message: 'User registered successfully.', user: { id: user.id, username: user.username } });
  }

  // Route: POST /login - authenticate and issue token
  if (req.method === 'POST' && pathname === '/login') {
    const body = await parseJsonBody(req);
    if (!body || !body.username || !body.password) {
      return sendJson(res, 400, { error: 'Username and password are required.' });
    }
    const user = users.find((u) => u.username === body.username && u.password === body.password);
    if (!user) {
      return sendJson(res, 401, { error: 'Invalid credentials.' });
    }
    const token = generateToken({ userId: user.id, username: user.username, iat: Math.floor(Date.now() / 1000) });
    return sendJson(res, 200, { message: 'Login successful.', token });
  }

  // Protected routes start with /users
  if (pathname.startsWith('/users')) {
    const authPayload = authenticateRequest(req);
    if (!authPayload) {
      return sendJson(res, 401, { error: 'Unauthorized: missing or invalid token.' });
    }

    // Route: GET /users - return list of users
    if (req.method === 'GET' && pathname === '/users') {
      // Expose id and username, but not password
      const safeUsers = users.map((u) => ({ id: u.id, username: u.username }));
      return sendJson(res, 200, { users: safeUsers });
    }

    // Route: POST /users - create a user (admin-style)
    if (req.method === 'POST' && pathname === '/users') {
      const body = await parseJsonBody(req);
      if (!body || !body.username || !body.password) {
        return sendJson(res, 400, { error: 'Username and password are required.' });
      }
      const existing = users.find((u) => u.username === body.username);
      if (existing) {
        return sendJson(res, 409, { error: 'Username already exists.' });
      }
      const newUser = {
        id: nextUserId++,
        username: body.username,
        password: body.password,
      };
      users.push(newUser);
      return sendJson(res, 201, { message: 'User created.', user: { id: newUser.id, username: newUser.username } });
    }

    // Route: PUT /users/:id - update a user
    if (req.method === 'PUT' && pathname.startsWith('/users/')) {
      const userId = getUserIdFromPath(pathname);
      if (userId === null) {
        return sendJson(res, 400, { error: 'Invalid user ID.' });
      }
      const body = await parseJsonBody(req);
      if (!body) {
        return sendJson(res, 400, { error: 'Request body is required.' });
      }
      const user = users.find((u) => u.id === userId);
      if (!user) {
        return sendJson(res, 404, { error: 'User not found.' });
      }
      // Update allowed fields: username and password
      if (body.username) {
        const exists = users.some((u) => u.username === body.username && u.id !== userId);
        if (exists) {
          return sendJson(res, 409, { error: 'Username already in use.' });
        }
        user.username = body.username;
      }
      if (body.password) {
        user.password = body.password;
      }
      return sendJson(res, 200, { message: 'User updated.', user: { id: user.id, username: user.username } });
    }

    // Route: DELETE /users/:id - delete a user
    if (req.method === 'DELETE' && pathname.startsWith('/users/')) {
      const userId = getUserIdFromPath(pathname);
      if (userId === null) {
        return sendJson(res, 400, { error: 'Invalid user ID.' });
      }
      const index = users.findIndex((u) => u.id === userId);
      if (index === -1) {
        return sendJson(res, 404, { error: 'User not found.' });
      }
      users.splice(index, 1);
      return sendJson(res, 200, { message: 'User deleted.' });
    }

    // If a request reaches here, the method/path is not supported
    return sendJson(res, 404, { error: 'Not found.' });
  }

  // Fallback for all other routes
  return sendJson(res, 404, { error: 'Not found.' });
});

// Start the server
server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});