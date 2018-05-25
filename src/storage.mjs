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

  setItem(key, value) {
    value === undefined ? this.docs.delete(key) : this.docs.set(key, value)
    this.queue.push(key)
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
    this.writer.on('drain', () => this.controlWriteFlow())
  }

  controlWriteFlow() {
    this.isFlushing = false
    !this.queue.length ? this.emit('drain') : this.flushHandler()
  }

  flushToStorage() {
    const length = this.queue.length
    let chunkLength = 0
    let entry = ``
    let key
    this.isFlushing = true
    for (let i = 0; i < length; i++) {
      key = this.queue[i]
      entry += `{${key}: ${this.docs.get(key)}}\n`
      chunkLength++
      if (chunkLength < this.writerPack && i < length - 1) continue
      this.initFlush(entry)
      entry = ''
      chunkLength = 0
    }
    this.queue = []
  }

  initFlush(data) {
    const isDrained = this.writer.write(data, err => {
      if (isDrained) {
        this.controlWriteFlow()
      }
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
