const Player = require('./Player')
const p2 = require('p2')

class Game {
  constructor (io) {
    this.io = io
    this.players = []
    this.world = new p2.World({
      gravity: [0, 0]
    })

    this.bounds = {
      x: 800,
      y: 600
    }

    // this.dt = 0
    // this.start = new Date()

    this.timeStep = 1 / 60

    setInterval(() => {
      this.update()
    }, 1000 * this.timeStep)

    io.on('connection', (socket) => {
      this.handleClientConnection(socket)
    })
  }

  handleClientConnection (socket) {
    const { players, world } = this

    players.forEach((player) => {
      socket.emit('enemyInitialized', player.serialize())
    })

    const newPlayer = new Player(this, socket, 50, 50)
    world.addBody(newPlayer.body)

    players.push(newPlayer)

    socket.emit('playerInitialized', newPlayer.serialize())
    socket.broadcast.emit('enemyInitialized', newPlayer.serialize())

    socket.on('disconnect', () => {
      this.handleClientDisconnect(socket)
    })
  }

  handleClientDisconnect (socket) {
    const { players, world } = this
    const playerIdx = players.findIndex(player => player.socket.id === socket.id)
    const player = players[playerIdx]

    world.removeBody(player.body)
    players.splice(playerIdx, 1)

    socket.broadcast.emit('playerRemoved', socket.id)
  }

  update () {
    this.world.step(this.timeStep)

    this.players.forEach(player => {
      player.update()
    })
  }
}

module.exports = Game
