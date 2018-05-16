// counter: 72563
// 1 72564
// 2 72564
// f1 = [{a: b},{c: d}]
// t1 -> P1 & P2 read f1
// P1 = [{a: b}, {c: d}, {e: f}]
// P2 = [{a: b}, {c: d}, {g: h}]
// t2 -> P1 writes first, P2 will overwrite
// t3 -> P2 writes first, P1 will overwrite
// t4 -> P1 & P2 write to disk
// f2 =

import Storage from './../src/storage'
const database = new Storage()

database.setItem('Superman', {
    publisher: 'DC Comics',
    year: 1933
})
database.setItem('Deadpool', {
    publisher: 'Marvel Comics',

    year: 2016
})

console.log(database.syncStorage())