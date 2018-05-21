import fs from 'fs'
import { logWithTime, log } from './util'

export default class Storage {
  constructor() {
    this.dirName = process.cwd() + '/src/db'
    this.DB = new Map()

    this.syncStorage()
    // if (fs.existsSync(`${this.dirName}/data.kvstore`)) {
    //   fs.watch(this.dirName, (event, fileName) => {
    //     this.syncStorage()
    //   })
    // }
  }

  async setItem(key, value) {
    this.DB.set(key, value)
    const writer = fs.createWriteStream(`${this.dirName}/data.kvstore`)
    writer.write(JSON.stringify(Array.from(this.DB.entries())))
    // writer.end()
    // writer.close(console.error('Disk write process completed'))
    let x = await this.DB.get(key)
    return [key, x]
  }

  getItem(key) {
    return this.DB.get(key)
  }

  removeItem(key) {
    return this.DB.del(key)
  }

  syncStorage() {
    this.reader = fs.createReadStream(`${this.dirName}/data.kvstore`)
    this.reader
      .on('data', data => {
        this.DB = new Map(JSON.parse(data))
        // log('Synchronize store...', 'mg')
      })
      .on('error', err => {
        console.error('Error receiving data', err) // READ if there was an error receiving data.
      })
      .on('end', () => {
        // log('Storage sync complete.', 'g') // READ fires when no more data will be provided.
      })
      .on('close', () => {
        // log('Stream closed! Reader going to sleep.', 'b') // WRITEABLE not all streams emit this.
      })
  }
}
