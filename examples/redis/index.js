const { createClient } = require('redis')
const view = require('point-of-view')
const nunjucks = require('nunjucks')

const fastifyCloudPrnt = require('../../index.js')

const JOB_DATA = 'printJobData'
const PRINT_QUEUE = 'printJobQueue'
const REDIS_URL = process.env.REDIS_URL

module.exports = async function redis (fastify, options) {
  // redis connection url defaults to localhost on port 6379
  const redis = createClient({ url: REDIS_URL })
  await redis.connect()

  await fastify.register(view, {
    engine: { nunjucks }
  })

  await fastify.register(fastifyCloudPrnt, {
    queueJob: async (token, jobData) => {
      await redis.HSET(JOB_DATA, token, JSON.stringify(jobData))
      await redis.LPUSH(PRINT_QUEUE, token)
    },
    getJob: async () => {
      const token = await redis.LINDEX(PRINT_QUEUE, 0)
      return token === undefined ? null : token
    },
    getJobData: async token => {
      const jsonJobData = await redis.HGET(JOB_DATA, token)
      if (!jsonJobData) {
        return null
      }
      return JSON.parse(jsonJobData)
    },
    deleteJob: async token => {
      await redis.HDEL(JOB_DATA, token)
      const deletedPrintJob = await redis.LREM(PRINT_QUEUE, 1, token)

      return deletedPrintJob > 0
    },
    routePrefix: '/cloud-prnt',
    templatesDir: 'examples/templates'
  })
}
