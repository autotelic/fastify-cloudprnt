import NodeCache from 'node-cache'
import fastifyCloudPrnt from '../../index.js'

export default async function basic (fastify, options) {
  const printQueue = new NodeCache()

  fastify.register(fastifyCloudPrnt, {
    queueJob: (key, val) => printQueue.set(key, val),
    getJob: () => {
      const token = printQueue.keys().reverse().find(Boolean)
      return token === undefined ? null : token
    },
    getJobData: key => {
      const jobData = printQueue.get(key)
      return jobData === undefined ? null : jobData
    },
    deleteJob: key => {
      const deleted = printQueue.del(key)
      return deleted > 0
    }
  })
}
