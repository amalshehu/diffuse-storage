import http from 'http'
import cluster from 'cluster'
import os from 'os'
import { mapToJson, log } from './util'
import Storage from './storage'
const numCPUs = os.cpus().length

const database = new Storage()

// database.setItem('abc', 123)
// database.setItem('abc', 123)

setTimeout(() => {
  database.setItem('abc', 100000)
  console.log('key: abc', 'value', database.getItem('abc'))
  // database.setItem('absc', 124)
}, 200)

// if (cluster.isMaster) {
//   log(`Master ${process.pid} is running`, 'mg')
//   for (let i = 0; i < numCPUs; i++) {
//     cluster.fork()
//   }
//   cluster.on('exit', (worker, code, signal) => {
//     log(`worker ${worker.process.pid} died`, 'r')
//   })
// } else {
// Workers can share any TCP connection
// In this case it is an HTTP server
const server = http.createServer()
server.on('request', (req, res) => {
  switch (req.url) {
    case '/':
      res.writeHead(200) // 200: OK
      res.end()
      break
    case '/set':
      if (req.method === 'POST') {
        let body = ''
        req.on('data', chunk => {
          body += chunk.toString() // Convert buffer to string
        })
        req.on('end', () => {
          const data = JSON.parse(body)
          const value = Object.keys(data).map(i => [i, data[i]])
          res.writeHead(201) // 201: CREATED
          database.setItem(...value[0])
          res.end('INSERT e0d123e5f316bef78bfdf5a008837577 OK') // Mock
        })
      }
      break
    case '/get':
      res.writeHead(200, {
        // 200: SUCCESS
        'Content-Type': 'application/json'
      })

      let d = JSON.stringify(database.getItem('abc'))
      res.end(d)
      // res.end(mapToJson(database.DB))
      break
    case '/delete':
      res.writeHead(204) // 204: NO CONTENT
      res.end()
      break
    default:
      res.writeHead(404) // 404: NOT FOUND
      res.end()
  }
})
server.listen(8000)

log('Server is listening on http://127.0.0.1:8000/', 'g')
//   log(`Worker ${process.pid} started`, 'y')
// }
