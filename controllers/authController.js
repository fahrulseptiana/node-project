const userModel = require('../models/userModel');
const { generateToken } = require('../utils/jwt');

async function register(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const existing = userModel.findByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists.' });
  }
  const user = userModel.createUser(username, password);
  return res.status(201).json({ message: 'User registered successfully.', user });
}

async function login(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const user = userModel.findByUsername(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }
  const token = generateToken({ userId: user.id, username: user.username, iat: Math.floor(Date.now() / 1000) });
  return res.status(200).json({ message: 'Login successful.', token });
}

module.exports = { register, login };
