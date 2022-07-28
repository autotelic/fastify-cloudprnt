import test from 'ava'
import sinon from 'sinon'
import Fastify from 'fastify'
import fastifyCloudPrnt, { defaultOptions } from './index.js'

test('default options', async (t) => {
  t.deepEqual(defaultOptions.getJobData(), {})
  t.is(defaultOptions.getJob(), null)
  t.false(defaultOptions.queueJob())
  t.false(defaultOptions.deleteJob())
})

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

  t.deepEqual(response.json(), {
    jobReady: true,
    jobToken: 'ABC123',
    mediaTypes: [
      'application/vnd.star.starprntcore'
    ]
  })
})

test('get job, success', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => ({}),
    viewOptions: { root: './examples' }
  })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  t.is(response.statusCode, 200)
  t.is(response.headers['content-type'], 'application/vnd.star.starprntcore')
})

test('get job, not found', async (t) => {
  const jobToken = 'ABC123'
  const fastify = Fastify()

  fastify.register(fastifyCloudPrnt, {
    getJobData: (token) => null
  })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'GET',
    url: `/?token=${jobToken}`
  })

  t.is(response.statusCode, 404)
  t.is(response.headers['content-type'], 'text/plain; charset=utf-8')
})

test('delete job, success', async (t) => {
  const token = 'ABC123'
  const fastify = Fastify()

  const deleteJob = sinon.stub().returns(true)

  fastify.register(fastifyCloudPrnt, { deleteJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'DELETE',
    url: `/?token=${token}`
  })

  t.true(deleteJob.calledWith(token))
  t.is(response.statusCode, 200)
  t.deepEqual(response.json(), { token })
})

test('delete job, not found', async (t) => {
  const token = 'ABC123'
  const fastify = Fastify()

  const deleteJob = sinon.stub().returns(false)

  fastify.register(fastifyCloudPrnt, { deleteJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'DELETE',
    url: `/?token=${token}`
  })

  t.true(deleteJob.calledWith(token))
  t.is(response.statusCode, 404)
  t.deepEqual(response.json(), { token })
})

test('queue job', async (t) => {
  const token = 'ABC123'
  const jobData = { foo: 'bar' }
  const fastify = Fastify()

  const queueJob = sinon.spy()

  fastify.register(fastifyCloudPrnt, { queueJob })
  await fastify.ready()

  const response = await fastify.inject({
    method: 'POST',
    url: '/job',
    body: {
      token,
      jobData
    }
  })

  t.true(queueJob.calledWith(token, jobData))
  t.is(response.statusCode, 201)
  t.deepEqual(response.json(), { token })
})
