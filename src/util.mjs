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
// fs.watch(this.dirName, (event, fileName) => {
//     logWithTime(`${event} ${fileName}`)
// })
