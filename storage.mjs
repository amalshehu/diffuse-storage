import fs from 'fs'

class Storage {
  constructor() {
    this.DB = new Map()
  }

  setItem(key, value) {
    this.DB.set(key, value)
    fs.writeFileSync('./data.json', JSON.stringify(this.DB), 'utf-8')
  }

  getItem(key) {
    return this.DB.get(key)
  }

  removeItem(key) {
    return this.DB.delete(key)
  }

}

const database = new Storage()
database.setItem('user', 123)

let config
try {
  config = fs.readFileSync('./data.json')
  config = JSON.parse(config)
  console.log('data', config);

} catch (e) {
  console.log('Error in file')
}