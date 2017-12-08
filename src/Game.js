const Player = require('./Player')

class Game {
  constructor (io) {
    this.io = io
    this.players = []

    io.on('connection', (socket) => {
      const newPlayer = new Player(socket, 50, 50)

      this.players.push(newPlayer)

      socket.emit('playerInitialized', newPlayer.serialize())
    })
  }
}

module.exports = Game
