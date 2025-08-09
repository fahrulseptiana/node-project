const register = require('./auth/register');
const login = require('./auth/login');
const listUsers = require('./users/listUsers');
const createUser = require('./users/createUser');
const updateUser = require('./users/updateUser');
const deleteUser = require('./users/deleteUser');

function mergePaths(...parts) {
  return parts.reduce((acc, part) => {
    for (const [path, methods] of Object.entries(part)) {
      acc[path] = { ...(acc[path] || {}), ...methods };
    }
    return acc;
  }, {});
}

const paths = mergePaths(
  register,
  login,
  listUsers,
  createUser,
  updateUser,
  deleteUser
);

module.exports = {
  openapi: '3.0.0',
  info: {
    title: 'Node Project API',
    version: '1.0.0',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths,
};
