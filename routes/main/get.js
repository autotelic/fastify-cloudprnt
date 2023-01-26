const fs = require('fs')
const path = require('path')
const cp = require('child_process')

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
    const jobData = await this.cloudPrnt.getJobData(token)
    if (jobData === null) {
      return reply.code(404).send('Job not found')
    }
    const renderedJob = await this.view('templates/receipt.stm', jobData)

    const fileName = `/tmp/${token}.stm`
    fs.writeFileSync(fileName, renderedJob, { flag: 'w+' })
    const mimeType = 'application/vnd.star.starprntcore'

    const prntCommandData = cp.execSync(
        `cputil decode ${mimeType} ${fileName} -`,
        {
          encoding: null,
          stdio: ['ignore', 'pipe', 'pipe']
        }
    )

    return reply
      .type(mimeType)
      .send(prntCommandData)
  }
}
