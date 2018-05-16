import fs from 'fs'

export default class Storage {
  constructor() {
    this.DB = this.syncStorage() || new Map()
  }

  setItem(key, value) {
    this.DB.set(key, value)
    fs.writeFileSync(
      'src/db/data.kvstore',
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
      data = fs.readFileSync('src/db/data.kvstore')
      return new Map(JSON.parse(data))
    } catch (e) {
      console.log('Error in file')
    }
  }
}