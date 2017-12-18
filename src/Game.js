const Player = require('./Player')
const p2 = require('p2')
const { SPAWN_OFFSET } = require('./const')
const { getRandomInt } = require('./utils')

const MAX_PLAYERS = 6

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

    this.world.on('impact', ({ bodyA, bodyB }) => {
      let player, bullet

      if (bodyA.gameEntityType === 'BULLET') {
        player = bodyB.player
        bullet = bodyA.bullet

      } else {
        player = bodyA.player
        bullet = bodyB.bullet
      }

      const wasKilled = player.hit(bullet.damage)
      if (wasKilled) {
        bullet.player.increaseKillScore()
      }
      bullet.destroy()
    })
  }

  handleClientConnection (socket) {
    const { players, world } = this

    if (players.length < MAX_PLAYERS) {
      players.forEach((player) => {
        socket.emit('enemyInitialized', player.serialize())
      })

      const collisionGroupId = 'PLAYER_' + (players.length + 1)
      const newPlayer = new Player(
        players.length, this, socket,
        getRandomInt(SPAWN_OFFSET, this.bounds.x - SPAWN_OFFSET),
        getRandomInt(SPAWN_OFFSET, this.bounds.y - SPAWN_OFFSET),
        collisionGroupId
      )

      world.addBody(newPlayer.body)
      players.push(newPlayer)

      socket.emit('playerInitialized', newPlayer.serialize())
      socket.broadcast.emit('enemyInitialized', newPlayer.serialize())
      console.log(players.length)

      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket)
        console.log(players.length)
      })
    }
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
