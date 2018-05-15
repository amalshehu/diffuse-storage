import fs from 'fs'
import http from 'http'

class Storage {
  constructor() {
    this.DB = this.syncStorage() || new Map()
  }

  setItem(key, value) {
    this.DB.set(key, value)
    fs.writeFileSync(
      './data.json',
      JSON.stringify(Array.from(this.DB.entries())),
      'utf-8'
    )
  }

  getItem(key) {
    return this.DB.get(key)
  }

  removeItem(key) {
    return this.DB.delete(key)
  }

  syncStorage() {
    let data
    try {
      data = fs.readFileSync('./data.json')
      return new Map(JSON.parse(data))
    } catch (e) {
      console.log('Error in file')
    }
  }
}

const database = new Storage()

database.setItem('Superman', {
  publisher: 'DC Comics',
  year: 1933
})
database.setItem('Deadpool', {
  publisher: 'Marvel Comics',
  year: 2016
})

const mapToJson = (data) => {
  return JSON.stringify([...data].map(([key, obj]) => ({
    key,
    ...obj
  })))
}

// Server
const server = http.createServer()
server.on('request', (req, res) => {
  switch (req.url) {
    case '/set':
      res.writeHead(201) // 201: CREATED
      res.end('Created #4k3hhjg45kqtj67')
      break
    case '/get':
      res.writeHead(200, { // 200: SUCCESS
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