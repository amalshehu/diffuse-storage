import fs from 'fs'
import { logWithTime, log } from './util'
import EventEmitter from 'events'

export default class Storage extends EventEmitter {
  constructor(fileName = 'storage.db') {
    super()
    this.path = process.cwd() + '/src/db/' + fileName
    this.docs = new Map()
    this.queue = []
    this.initFileStreams()
    this.syncStorage()
  }

  setItem(key, value) {
    this.docs.set(key, value)
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
    this.setItem(key, undefined)
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
    let entry = ``
    let key
    this.isFlushing = true
    for (let i = 0; i < length; i++) {
      key = this.queue[i]
      entry += `${JSON.stringify({ key, val: this.docs.get(key) })}\n`
      this.initFlush(entry)
      entry = ``
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
    if (entry.val != undefined) {
      this.docs.set(entry.key, entry.val)
    }
  }
}
