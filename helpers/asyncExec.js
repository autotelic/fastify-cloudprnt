const cp = require('child_process')

function asyncExec (cmd, args) {
  return new Promise((resolve, reject) => {
    const process = cp.spawn(cmd, args)
    const stdout = []
    process.stdout.on('data', (data) => {
      stdout.push(data)
    })

    process.on('error', (e) => {
      reject(e)
    })

    process.on('close', () => {
      resolve(Buffer.concat(stdout))
    })
  })
}

module.exports = asyncExec
