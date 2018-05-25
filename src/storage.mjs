import fs from 'fs'
import { logWithTime, log } from './util'
import EventEmitter from 'events'

export default class Storage extends EventEmitter {
  constructor(fileName = 'storage.db') {
    super()
    this.path = process.cwd() + '/src/db/' + fileName
    this.DB = new Map()
    this.docs = new Map()
    this.writerPack = 1024
    this.queue = []
    this.initFileStreams()
    this.syncStorage()
  }

  setItem(key, value, callback) {
    value === undefined ? this.docs.delete(key) : this.docs.set(key, value)
    !callback ? this.queue.push(key) : this.queue.push([key, callback])
    this.flushHandler()
  }

  flushHandler() {
    if (this.isFlushing || !this.queue.length) return
    this.flushToStorage()
  }

  getItem(key) {
    return this.docs.get(key)
  }

  removeItem(key) {
    return this.docs.set(key, undefined)
  }

  initFileStreams() {
    this.reader = fs.createReadStream(this.path, {
      encoding: 'utf-8',
      flags: 'r'
    })
    this.writer = fs.createWriteStream(this.path, {
      encoding: 'utf-8',
      flags: 'a' // 'a' Append only
    })
  }

  syncStorage() {
    this.reader
      .on('data', buf => this.processIncomingBuffer(buf))
      .on('error', err => console.error('Error receiving data', err))
      .on('end', () => log('Storage sync complete.', 'g'))
    this.writer.on('drain', () => this.writeDrain())
  }

  writeDrain() {
    this.isFlushing = false
    !this.queue.length ? this.emit('drain') : this.flushHandler()
  }

  flushToStorage() {
    const length = this.queue.length
    let chunkLength = 0
    let dataStr = ``
    let key
    let cbs = []
    this.isFlushing = true
    for (let i = 0; i < length; i++) {
      key = this.queue[i]
      if (Array.isArray(key)) {
        cbs.push(key[1])
        key = key[0]
      }
      dataStr += `{${key}: ${this.docs.get(key)}}\n`
      chunkLength++
      if (chunkLength < this.writerPack && i < length - 1) continue
      this.initFlush(cbs, dataStr)
      dataStr = ''
      chunkLength = 0
      cbs = []
    }
    this.queue = []
  }

  initFlush(cbs, data) {
    const isDrained = this.writer.write(data, err => {
      if (isDrained) {
        this.writeDrain()
      }
      if (!cbs.length && err) {
        this.emit('error', err)
        return
      }
      this.handleCallbacks(err, cbs)
    })
  }

  processIncomingBuffer(buf) {
    let buffers = ''
    buffers += buf
    if (buf.lastIndexOf('\n') == -1) return
    const buffer = buffers.split('\n')
    buffers = buffer.pop()
    buffer.forEach(line => {
      if (!line) {
        this.emit('error', new Error('Empty lines in database'))
        return
      }
      this.updateInmemory(line)
      return
    })
  }

  handleCallbacks(err, cbs) {
    while (cbs.length) {
      cbs.shift()(err)
    }
  }

  updateInmemory(data) {
    let entry = JSON.parse(data)
    key = [...Object.keys(entry)]

    if (entry[key] === undefined) {
      this.docs.delete(key)
    } else {
      if (!this.docs.has(key)) {
        this.docs.set(key, entry[key])
      }
    }
  }
}
