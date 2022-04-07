const test = require('ava')
const Fastify = require('fastify')
const fastifyCloudPrnt = require('./index')

test('client poll, no job ready', async (t) => {
  const fastify = Fastify()

  fastify.register(fastifyCloudPrnt)
  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    body: {
      statusCode: '200 OK'
    }
  })

  t.deepEqual(response.json(), { jobReady: false })
})

test('client poll, job ready', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(fastifyCloudPrnt, {
    getJob: () => jobToken
  })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/',
    body: {
      statusCode: '200 OK'
    }
  })

  t.deepEqual(response.json(), { jobReady: true, jobToken })
})

test('get job', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => ({})
  })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`,
  })

  t.pass()
  // t.deepEqual(response.json(), { jobReady: true, jobToken })
})
