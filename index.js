const Game = require('./src/Game')

const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)

new Game(io)

http.listen(3000, function () {
  console.log('listening on *:3000')
})
