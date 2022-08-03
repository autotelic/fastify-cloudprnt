import fs from 'fs'
import { execaCommand } from 'execa'

export default {
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
    if (jobData === null) {
      return reply.code(404).send('Job not found')
    }
    const renderedJob = await this.view('templates/receipt.stm', jobData)

    const fileName = `/tmp/${token}.stm`
    fs.writeFileSync(fileName, renderedJob, { flag: 'w+' })
    const mimeType = 'application/vnd.star.starprntcore'

    const subprocess = await execaCommand(
      `cputil decode ${mimeType} ${fileName} -`,
      { encoding: null }
    )

    return reply
      .type(mimeType)
      .send(subprocess.stdout)
  }
}
