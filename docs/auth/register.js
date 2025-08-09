module.exports = {
  '/register': {
    post: {
      tags: ['Auth'],
      summary: 'Register a new user',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                password: { type: 'string' },
              },
              required: ['username', 'password'],
            },
          },
        },
      },
      responses: {
        201: { description: 'User registered successfully' },
        400: { description: 'Username and password are required' },
        409: { description: 'Username already exists' },
      },
    },
  },
};
