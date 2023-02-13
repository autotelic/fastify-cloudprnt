const { promises: fs } = require('fs')
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
    const {
      getJobData,
      defaultTemplate,
      templatesDir
    } = this.cloudPrnt

    const jobData = await getJobData(token)
    if (jobData === null) {
      return reply.code(404).send('Job not found')
    }

    const template = jobData.template || defaultTemplate
    const templatePath = path.join(templatesDir, template)
    const renderedJob = await this.view(templatePath, jobData)

    const printFilePath = `/tmp/${token}.stm`
    await fs.writeFile(printFilePath, renderedJob, { flag: 'w+' })
    const mimeType = 'application/vnd.star.starprntcore'

    const prntCommandData = cp.execSync(
        `cputil decode ${mimeType} ${printFilePath} -`,
        {
          encoding: null,
          stdio: ['ignore', 'pipe', 'pipe']
        }
    )

    await fs.unlink(printFilePath)

    return reply
      .type(mimeType)
      .send(prntCommandData)
  }
}
