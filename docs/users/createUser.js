module.exports = {
  '/users': {
    post: {
      tags: ['Users'],
      summary: 'Create user',
      security: [{ bearerAuth: [] }],
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
        201: { description: 'User created' },
        400: { description: 'Username and password are required' },
        401: { description: 'Unauthorized' },
        409: { description: 'Username already exists' },
      },
    },
  },
};
