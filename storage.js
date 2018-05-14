class Storage {
  constructor() {
    this.DB = new Map()
  }

  setItem(key, value) {
    return this.DB.set(key, value)
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
console.log(database.getItem('user'))
