import http from 'http'
import Storage from './storage'
import { mapToJson } from './util'

const database = new Storage()

database.setItem('Superman', {
  publisher: 'DC Comics',
  year: 1933
})
database.setItem('Deadpool', {
  publisher: 'Marvel Comics',
  year: 2016
})

// Server
const server = http.createServer()
server.on('request', (req, res) => {
  switch (req.url) {
    case '/set':
      res.writeHead(201) // 201: CREATED
      res.end('Created #4k3hhjg45kqtj67')
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
