const http = require('http')
const faker = require('faker')

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
// const dataSet = []
// for (let i = 0; i < 2000; i++) {
//   let randomName = faker.name.findName()
//   let randomText = faker.lorem.paragraphs()
//   dataSet.push([randomName, { publisher: 'Marvel Comics', desc: randomText }])
// }

describe('DISK READ/WRITE TESTS', () => {
  for (let i = 0; i < 2000; i++) {
    test.concurrent(`Concurrent Test Execution ${i + 1}`, async () => {
      let d2 = {}
      d2[`key${i}`] = { publisher: 'Marvel Comics', year: 1 + i }
      const data = await request(JSON.stringify(d2))
      expect(data).toBeTruthy()
    })
  }
})

// describe('Database write speed test', () => {
//   for (let i = 0; i < 100; i++) {
//     test.concurrent('Concurrent Test Execution', async () => {
//       let randomName = faker.name.findName()
//       let randomText = faker.lorem.paragraphs()
//       let d1 = {}
//       d1.superman = { publisher: 'DC Comics', year: 1 + i }
//       const data = await request(JSON.stringify(d1))
//       expect(data).toBeTruthy()

//     })
