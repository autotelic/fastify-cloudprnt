const NodeCache = require('node-cache')
const view = require('point-of-view')
const nunjucks = require('nunjucks')

const fastifyCloudPrnt = require('../../index.js')

module.exports = async function basic (fastify, options) {
  await fastify.register(view, {
    engine: { nunjucks }
  })

  const printQueue = new NodeCache()

  fastify.register(fastifyCloudPrnt, {
    queueJob: (token, jobData) => printQueue.set(token, jobData),
    getJob: () => {
      const token = printQueue.keys().reverse().find(Boolean)
      return token === undefined ? null : token
    },
    getJobData: token => {
      const jobData = printQueue.get(token)
      return jobData === undefined ? null : jobData
    },
    deleteJob: token => {
      const deleted = printQueue.del(token)
      return deleted > 0
    },
    templatesDir: 'examples/templates/',
    routePrefix: '/cloud-prnt'
  })
}
