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
    const {
      getJobData,
      defaultTemplateName,
      templatesDir
    } = this.cloudPrnt

    const jobData = await getJobData(token)
    if (jobData === null) {
      return reply.code(404).send('Job not found')
    }

    const templateName = jobData.templateName || defaultTemplateName
    const templatePath = path.join(templatesDir, templateName)
    const renderedJob = await this.view(templatePath, jobData)

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
