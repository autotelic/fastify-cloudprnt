const test = require('ava')
const asyncExec = require('./asyncExec')

test('asyncExec should resolve to stdout buffer', async (t) => {
  const buffer = await asyncExec('echo', ['foo', 'bar'])
  t.is(buffer.toString(), 'foo bar\n')
})

test('asyncExec should throw an error if the command fails', async (t) => {
  await t.throwsAsync(asyncExec('INVALID_COMMAND'))
})
