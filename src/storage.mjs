import fs from 'fs'
import { logWithTime } from './util'

export default class Storage {
  constructor() {
    this.dirName = process.cwd() + '/src/db'
    this.DB = new Map()
    fs
      .createReadStream(`${this.dirName}/data.kvstore`)
      .on('data', async data => {
        if (data) {
          this.DB = await new Map(JSON.parse(data))
        }
      })
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
    return this.DB.delete(key)
  }

  syncStorage() {
    let data
    this.readStream.on('data', function(d) {
      data = d
    })
    return data ? new Map(JSON.parse(data)) : new Map()
  }
}
