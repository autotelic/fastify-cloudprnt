
const superchild = require('superchild')

module.exports = {
  method: 'GET',
  url: '/',
  schema: {
    querystring: {
      type: 'object',
      required: ['token'],
      properties: {
        token: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object'
      }
    }
  },
  handler: async function getJobHandler (request, reply) {
    const { token } = request.query
    const jobData = await this.getJobData(token)
    const renderedJob = await this.view('templates/receipt.stm', { token })

    const child = superchild('cputil supportedinputs')
    child.on('stdout_line', function (line) {
      console.log('[stdout]: ', line)
    })

    reply.send({
      foo: 'bar'
    })
  }
}
