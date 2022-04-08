const fs = require('fs')
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

    const fileName = `/tmp/${token}.stm`
    fs.writeFileSync(fileName, renderedJob, { flag: 'w+' })

    console.log(fileName)

    const child = superchild(`cputil decode application/vnd.star.starprntcore ${fileName} -`)
    child.on('stderr_data', function (line) {
      console.log('[sterr]: ', line)
    })
    child.on('stdout_line', function (line) {
      console.log('[stdout]: ', line)
    })

    reply.send({
      foo: 'bar'
    })
  }
}
