'use strict'

const superchild = require('superchild')

async function fastifyCloudPrnt (fastify, options) {
  const schema = {
    body: {
      type: 'object',
      required: ['statusCode'],
      properties: {
        statusCode: { type: 'string' }
      }
    },
    response: {
      200: {
        type: 'object',
        required: ['jobReady'],
        properties: {
          jobReady: { type: 'boolean' },
          mediaTypes: { type: 'array' },
          clientAction: { type: 'array' },
          jobToken: { type: 'string' }
        }
      }
    }
  }

  fastify.post('/', { schema }, async (request, reply) => {
    const child = superchild('cputil supportedinputs')
    child.on('stdout_line', function (line) {
      console.log('[stdout]: ', line)
    })

    reply.send({
      jobReady: false
      // clientAction: [
      //   { request: 'ClientType', options: '' },
      //   { request: 'ClientVersion', options: '' },
      //   { request: 'Encodings', options: '' },
      //   { request: 'GetPollInterval', options: '' },
      //   { request: 'PageInfo', options: '' }
      // ]
    })
  })
}

module.exports = fastifyCloudPrnt
