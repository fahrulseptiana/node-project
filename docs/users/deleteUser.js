module.exports = {
  '/users/{id}': {
    delete: {
      tags: ['Users'],
      summary: 'Delete user',
      security: [{ bearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          schema: { type: 'integer' },
        },
      ],
      responses: {
        200: { description: 'User deleted' },
        400: { description: 'Invalid user ID' },
        401: { description: 'Unauthorized' },
        404: { description: 'User not found' },
      },
    },
  },
};
