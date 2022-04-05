const test = require('ava')
const Fastify = require('fastify')
const fastifyCloudPrnt = require('./index')

test('/', async (t) => {
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

  t.pass()
  console.log(response.json())
})
