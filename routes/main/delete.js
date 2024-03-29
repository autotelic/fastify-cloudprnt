module.exports = {
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
    const deleted = await this.cloudPrnt.deleteJob(token, request)
    const code = deleted
      ? 200
      : 404
    return reply
      .code(code)
      .send({ token })
  }
}
