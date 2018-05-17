// counter: 72563
// 1 72564
// 2 72564
// f1 = [{a: b},{c: d}]
// t1 -> P1 & P2 read f1
// P1 = [{a: b}, {c: d}, {e: f}]
// P2 = [{a: b}, {c: d}, {g: h}]
// t2 -> P1 writes first, P2 will overwrite
// t3 -> P2 writes first, P1 will overwrite
// t4 -> P1 & P2 write to disk
// f2 =

// import Storage from './../src/storage'
// const database = new Storage()

// database.setItem('Superman', {
//   publisher: 'DC Comics',
//   year: 1988
// })
// database.setItem('Deadpool', {
//   publisher: 'Marvel Comics',

//   year: 2016
// })

// console.log(database.DB)

const http = require('http')

var postData = JSON.stringify({
  Superman: { publisher: 'DC Comics', year: 2000 }
})

var options = {
  host: '127.0.0.1',
  port: 8000,
  path: '/set',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': postData.length
  }
}

var req = http.request(options, res => {
  console.log('statusCode:', res.statusCode)
  console.log('headers:', res.headers)

  res.on('data', chunk => {
    console.log(`BODY: ${chunk}`)
  })
})
req.on('error', e => {
  console.error(`problem with request: ${e.message}`)
})

// write data to request body
req.write(postData)
req.end()

const dataPromise = req

test.concurrent('one', async () => {
  const data = await dataPromise
})

test.concurrent('two', async () => {
  const data = await dataPromise
})
