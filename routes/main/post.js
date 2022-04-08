module.exports = {
  method: 'POST',
  url: '/',
  schema: {
    body: {
      type: 'object',
      required: ['statusCode'],
      properties: {
        statusCode: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        required: ['jobReady'],
        properties: {
          jobReady: { type: 'boolean' },
          mediaTypes: { type: 'array' },
          clientAction: { type: 'array' },
          jobToken: { type: 'string' }
        }
      }
    }
  },
  handler: async function pollHandler (request, reply) {
    const jobToken = await this.getJob()
    const jobReady = jobToken === null
      ? false
      : true

    let jobReadyResponse = {}
    if (jobReady) {
      jobReadyResponse = {
        jobToken,
      }
    }

    reply.send({
      jobReady,
      ...jobReadyResponse,
    })
  }
}