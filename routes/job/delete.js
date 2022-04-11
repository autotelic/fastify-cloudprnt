export default {
  method: 'DELETE',
  url: '/job',
  schema: {
    body: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' }
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
    const { token } = request.body
    const deleted = this.deleteJob(token)
    const code = deleted === 0
      ? 404
      : 200
    reply
      .code(code)
      .send({ token })
  }
}
