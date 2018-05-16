import fs from 'fs'
import path from 'path'

export default class Storage {
  constructor() {
    this.dirName = path.join(process.cwd(), 'src/db')
    fs.watch(this.dirName, (event, fileName) => {
      console.log(`FileWatcher:`, event, fileName);
    })
    this.DB = this.syncStorage() || new Map()
  }

  setItem(key, value) {
    this.DB.set(key, value)
    fs.writeFileSync(
      `${this.dirName}/data.kvstore`,
      JSON.stringify(Array.from(this.DB.entries())),
      'utf-8'
    )
    console.log('Item stored');
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
      data = fs.readFileSync(`${this.dirName}/data.kvstore`)
      return new Map(JSON.parse(data))
    } catch (e) {
      console.log('Error in file')
    }
  }
}