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
    if (this.docs.has(key) && value === this.docs.get(key)) {
      return
    } else {
      this.docs.set(key, value)
      if (!callback) {
        this.queue.push(key)
      } else {
        this.queue.push([key, callback])
      }
    }
    this.flush()
  }

  getItem(key) {
    return this.docs.get(key)
  }

  removeItem(key) {
    return this.docs.delete(key)
  }
  initFileStreams() {
    this.reader = fs.createReadStream(this.path, {
      encoding: 'utf-8',
      flags: 'r'
    })
    this.writer = fs.createWriteStream(this.path, {
      encoding: 'utf-8',
      flags: 'a'
    })
  }
  syncStorage() {
    let buffers = ''
    this.reader
      .on('data', buf => {
        buffers += buf
        if (buf.lastIndexOf('\n') == -1) return
        const buffer = buffers.split('\n')
        buffers = buffer.pop()
        buffer.forEach(line => {
          if (!line) {
            this.emit('error', new Error('Empty lines in database'))
            return
          }
          let obj = JSON.parse(line)
          if (obj.val === undefined) {
            if (this.docs.has(obj.key)) {
            }
            this.docs.delete(obj.key)
          } else {
            if (!this.docs.has(obj.key)) {
              this.docs.set(obj.key, obj.val)
            }
          }
          return
        })
      })
      .on('error', err => {
        console.error('Error receiving data', err)
      })
      .on('end', () => {
        // log('Storage sync complete.', 'g') // READ fires when no more data will be provided.
      })
    this.writer
      .on('drain', () => {
        this.writeDrain()
      })
      .on('open', fd => {
        this.fdWrite = fd
      })
  }
  flush() {
    if (this.isFlushing || !this.queue.length) {
      return
    }
    this.flushToStorage()
  }
  writeDrain() {
    this.isFlushing = false

    if (!this.queue.length) {
      this.emit('drain')
    } else {
      this.flush()
    }
  }
  initFlush(cbs, data) {
    let isDrained
    if (!this.path) {
      process.nextTick(() => {
        this.handleCallbacks(null, cbs)
        this.writerDrain()
      })
      return
    }
    isDrained = this.writer.write(data, err => {
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
  handleCallbacks(err, cbs) {
    while (cbs.length) {
      cbs.shift()(err)
    }
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

      dataStr += `${JSON.stringify({ key, val: this.docs.get(key) })}\n`
      chunkLength++

      if (chunkLength < this.writerPack && i < length - 1) {
        continue
      }
      this.initFlush(cbs, dataStr)
      dataStr = ''
      chunkLength = 0
      cbs = []
    }
    this.queue = []
  }
}
