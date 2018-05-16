import fs from 'fs'
import path from 'path'
import { logWithTime } from './util'

export default class Storage {
  constructor() {
    this.dirName = process.cwd() + '/src/db'
    this.readStream = fs
      .createReadStream(`${this.dirName}/data.kvstore`)
      .on('data', async data => {
        if (data) {
          this.DB = await new Map(JSON.parse(data))
          console.log('D', this.DB)
        }
      })
    this.DB = new Map()
    // this.writeStream = fs.createWriteStream(`${this.dirName}/data.kvstore`, {
    //   flags: 'w'
    // })
    fs.watch(this.dirName, (event, fileName) => {
      logWithTime(`${event} ${fileName}`)
    })
  }

  setItem(key, value) {
    this.DB.set(key, value)
    fs
      .createWriteStream(`${this.dirName}/data.kvstore`)
      .write(JSON.stringify(Array.from(this.DB.entries())))
    console.log('Item stored')
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
