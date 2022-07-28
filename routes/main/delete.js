export default {
  method: 'DELETE',
  url: '/',
  schema: {
    querystring: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' },
        code: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' }
        }
      }
    }
  },
  handler: async function queueJobHandler (request, reply) {
    const { token } = request.query
    const deleted = this.deleteJob(token)
    const code = deleted
      ? 200
      : 404
    reply
      .code(code)
      .send({ token })
  }
}
