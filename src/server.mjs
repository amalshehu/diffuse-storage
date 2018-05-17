import http from 'http'
import Storage from './storage'
import { mapToJson } from './util'

const database = new Storage()
// Server
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
          body += chunk.toString() // convert Buffer to string
        })
        req.on('end', () => {
          const data = JSON.parse(body)
          const value = Object.keys(data).map(i => [i, data[i]])
          res.writeHead(201) // 201: CREATED
          database.setItem(...value[0]).then(result => {
            // console.log('res', result)
          })
          res.end('Created #4k3hhjg45kqtj67')
        })
      }
      break
    case '/get':
      res.writeHead(200, {
        // 200: SUCCESS
        'Content-Type': 'application/json'
      })
      res.end(mapToJson(database.DB))
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

// Print URL for accessing server
console.log('Server running at http://127.0.0.1:8000/')
