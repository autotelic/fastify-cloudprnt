module.exports = {
  method: 'POST',
  url: '/job',
  schema: {
    body: {
      type: 'object',
      required: ['token', 'jobData'],
      properties: {
        token: { type: 'string' },
        jobData: { type: 'object' }
      }
    },
    response: {
      201: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' }
        }
      }
    }
  },
  handler: async function queueJobHandler (request, reply) {
    const { token, jobData } = request.body
    await this.cloudPrnt.queueJob(token, jobData)
    return reply
      .code(201)
      .send({ token })
  }
}
