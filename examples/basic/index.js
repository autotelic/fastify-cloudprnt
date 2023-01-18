import NodeCache from 'node-cache'
import view from '@fastify/view'
import nunjucks from 'nunjucks'

import fastifyCloudPrnt from '../../index.js'

export default async function basic (fastify, options) {
  await fastify.register(view, {
    engine: { nunjucks },
    root: './examples'
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
    }
  })
}
