module.exports = {
  '/users': {
    get: {
      tags: ['Users'],
      summary: 'List users',
      security: [{ bearerAuth: [] }],
      responses: {
        200: { description: 'A list of users' },
        401: { description: 'Unauthorized' },
      },
    },
  },
};
