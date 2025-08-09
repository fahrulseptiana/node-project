const users = [];
let nextUserId = 1;

function reset() {
  users.length = 0;
  nextUserId = 1;
}
function createUser(username, password) {
  const user = { id: nextUserId++, username, password };
  users.push(user);
  return { id: user.id, username: user.username };
}

function findByUsername(username) {
  return users.find((u) => u.username === username);
}

function findById(id) {
  return users.find((u) => u.id === id);
}

function getAllUsers() {
  return users.map((u) => ({ id: u.id, username: u.username }));
}

function updateUser(id, data) {
  const user = findById(id);
  if (!user) return null;
  if (data.username) user.username = data.username;
  if (data.password) user.password = data.password;
  return { id: user.id, username: user.username };
}

function deleteUser(id) {
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) return false;
  users.splice(index, 1);
  return true;
}

module.exports = {
  createUser,
  findByUsername,
  findById,
  getAllUsers,
  updateUser,
  deleteUser,
  reset,
};
