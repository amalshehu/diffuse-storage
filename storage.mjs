import fs from 'fs'

class Storage {
  constructor() {
    this.DB = this.syncStorage() || new Map()
  }

  setItem(key, value) {
    this.DB.set(key, value)
    fs.writeFileSync('./data.json', JSON.stringify(Array.from(this.DB.entries())), 'utf-8')
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
// database.setItem('user', 123)
console.log(database);