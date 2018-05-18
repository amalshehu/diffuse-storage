export const mapToJson = data => {
  return JSON.stringify(
    [...data].map(([key, obj]) => ({
      key,
      ...obj
    }))
  )
}

export const logWithTime = message => {
  return console.log(`${new Date().toUTCString()}: ${message}`)
}
export const log = (message, code) => {
  const colors = {
    r: '\x1b[11m',
    y: '\x1b[36m',
    g: '\x1b[32m',
    mg: '\x1b[31m',
    b: '\x1b[33m'
  }
  const date = new Date()
  const formatTime = `${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') +
    date.getMinutes()}:${date.getSeconds()}`
  console.log(`${colors[code]}%s\x1b[0m`, `${formatTime}: ${message}`)
}

// fs.watch(this.dirName, (event, fileName) => {
//     logWithTime(`${event} ${fileName}`)
// })
