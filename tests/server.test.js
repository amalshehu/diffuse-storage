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

function request(postData) {
  return new Promise(resolve => {
    const options = {
      host: '127.0.0.1',
      port: 8000,
      path: '/set',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': postData.length
      }
    }

    const request = http.request(options, response => {
      let data = ''
      response.on('data', _data => (data += _data))
      response.on('end', () => resolve(data))
    })

    request.write(postData)
    request.end()
  })
}
const d1 = JSON.stringify({
  Superman: { publisher: 'DC Comics', year: 1888 }
})

const d2 = JSON.stringify({
  Superman: { publisher: 'DC Comics', year: 2006 }
})

test.concurrent('one', async () => {
  const data = await request(d1)
  console.log('Out', data)

  expect(data).toEqual('Created #4k3hhjg45kqtj67')
})

test.concurrent('two', async () => {
  const data = await request(d2)
  expect(data).toEqual('Created #4k3hhjg4kqtj67')
})
