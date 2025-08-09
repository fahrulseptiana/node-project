module.exports = {
  '/login': {
    post: {
      tags: ['Auth'],
      summary: 'Login a user',
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
        200: { description: 'Login success' },
        400: { description: 'Username and password are required' },
        401: { description: 'Invalid credentials' },
      },
    },
  },
};
