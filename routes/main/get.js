const { promises: fs } = require('fs')
const path = require('path')
const os = require('os')

const asyncExec = require('../../helpers/asyncExec.js')

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
      templatesDir,
      formatPrntCommandData
    } = this.cloudPrnt

    const jobData = await getJobData(token)
    if (jobData === null) {
      return reply.code(404).send('Job not found')
    }

    const template = jobData.template || defaultTemplate
    const templatePath = path.join(templatesDir, template)
    const renderedJob = await this.view(templatePath, jobData)
    const mimeType = 'application/vnd.star.starprntcore'

    let prntCommandData

    if (typeof formatPrntCommandData === 'function') {
      prntCommandData = await formatPrntCommandData(renderedJob)
    } else {
      const printFilePath = path.join(os.tmpdir(), `${token}.stm`)
      await fs.writeFile(printFilePath, renderedJob, { flag: 'w+' })
      prntCommandData = await asyncExec(
        'cputil',
        ['decode', mimeType, printFilePath, '-']
      )
      await fs.unlink(printFilePath)
    }

    return reply
      .type(mimeType)
      .send(prntCommandData)
  }
}
