module.exports = {
  '/users/{id}': {
    put: {
      tags: ['Users'],
      summary: 'Update user',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
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
            },
          },
        },
      },
      responses: {
        200: { description: 'User updated' },
        400: { description: 'Invalid user ID' },
        401: { description: 'Unauthorized' },
        404: { description: 'User not found' },
      },
    },
  },
};
