const userModel = require('../models/userModel');

async function listUsers(req, res) {
  const users = userModel.getAllUsers();
  return res.status(200).json({ users });
}

async function createUser(req, res) {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }
  const existing = userModel.findByUsername(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already exists.' });
  }
  const user = userModel.createUser(username, password);
  return res.status(201).json({ message: 'User created.', user });
}

async function updateUser(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }
  const updated = userModel.updateUser(id, req.body || {});
  if (!updated) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.status(200).json({ message: 'User updated.', user: updated });
}

async function deleteUser(req, res) {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID.' });
  }
  const deleted = userModel.deleteUser(id);
  if (!deleted) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.status(200).json({ message: 'User deleted.' });
}

module.exports = { listUsers, createUser, updateUser, deleteUser };
