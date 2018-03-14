const Player = require('./Player')
const p2 = require('p2')
const { SPAWN_OFFSET } = require('./const')
const { getRandomInt } = require('./utils')

const STATES = {
  WAITING_FOR_PLAYERS: 'WAITING_FOR_PLAYERS',
  COUNTDOWN: 'COUNTDOWN',
  IN_PROGRESS: 'IN_PROGRESS'
}

const PLAYERS = {
  PLAYER_1: {
    playerCollisionGroupId: 'TEAM_1',
    bulletCollisionGroupId: 'TEAM_1_BULLET'
  },
  PLAYER_2: {
    playerCollisionGroupId: 'TEAM_1',
    bulletCollisionGroupId: 'TEAM_1_BULLET'
  },
  PLAYER_3: {
    playerCollisionGroupId: 'TEAM_1',
    bulletCollisionGroupId: 'TEAM_1_BULLET'
  },
  PLAYER_4: {
    playerCollisionGroupId: 'TEAM_2',
    bulletCollisionGroupId: 'TEAM_2_BULLET'
  },
  PLAYER_5: {
    playerCollisionGroupId: 'TEAM_2',
    bulletCollisionGroupId: 'TEAM_2_BULLET'
  },
  PLAYER_6: {
    playerCollisionGroupId: 'TEAM_2',
    bulletCollisionGroupId: 'TEAM_2_BULLET'
  }
}

class Game {
  constructor(io) {
    this.io = io

    this.state = STATES.WAITING_FOR_PLAYERS

    this.players = {
      PLAYER_1: null,
      PLAYER_2: null,
      PLAYER_3: null,
      PLAYER_4: null,
      PLAYER_5: null,
      PLAYER_6: null
    }

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

    this.world.on('impact', (bodies) => {
      this.handleCollision(bodies)
    })
  }

  handleClientConnection (socket) {
    const { players, world } = this

    const slotId = this.findFreePlayerSlotId()

    if (slotId) {

      const collisionGroupId = slotId
      const newPlayer = new Player(
        slotId, this, socket,
        getRandomInt(SPAWN_OFFSET, this.bounds.x - SPAWN_OFFSET),
        getRandomInt(SPAWN_OFFSET, this.bounds.y - SPAWN_OFFSET),
        PLAYERS[slotId].playerCollisionGroupId
      )

      world.addBody(newPlayer.body)
      this.players[slotId] = newPlayer

      socket.emit('playerInitialized', newPlayer.serialize())
      // socket.broadcast.emit('enemyInitialized', newPlayer.serialize())

      Object.keys(this.players).forEach(slotId => {
        const player = this.players[slotId]

        if (player) {
          if (player.collisionGroupId !== newPlayer.collisionGroupId) {
            if (player.socket.id !== socket.id) {
              player.socket.emit('enemyInitialized', newPlayer.serialize())
              socket.emit('enemyInitialized', player.serialize())
            }
          } else {
            if (player.socket.id !== socket.id) {
              player.socket.emit('allyInitialized', newPlayer.serialize())
              socket.emit('allyInitialized', player.serialize())
            }
          }
        }
      })

      console.log('Added player to slot: ' + slotId)

      socket.on('disconnect', () => {
        this.handleClientDisconnect(socket)
      })

      if (!this.areFreePlayerSlotsLeft()) {
        this.state = STATES.COUNTDOWN
        console.log('Changed state to ' + this.state)
      }
    } else {
      console.log('No free player slots')
    }
  }

  findFreePlayerSlotId () {
    const slotIds = Object.keys(this.players)

    for (let i = 0; i < slotIds.length; i++) {
      const slotId = slotIds[i]

      if (this.players[slotId] === null) {
        return slotId
      }
    }

    return null
  }

  areFreePlayerSlotsLeft () {
    const freeSlotId = this.findFreePlayerSlotId()

    return freeSlotId !== null
  }

  findSlotIdBySocket (socket) {
    const slotIds = Object.keys(this.players)

    for (let i = 0; i < slotIds.length; i++) {
      const slotId = slotIds[i]
      const player = this.players[slotId]

      if (player && player.socket.id === socket.id) {
        return slotId
      }
    }

    return null
  }

  handleClientDisconnect (socket) {
    const { players, world } = this
    const slotId = this.findSlotIdBySocket(socket)
    const player = players[slotId]

    if (player) {
      world.removeBody(player.body)
      players[slotId] = null
      socket.broadcast.emit('playerRemoved', socket.id)

      console.log("Removed player " + slotId)
    }
  }

  handleCollision ({ bodyA, bodyB }) {
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
  }

  update () {
    this.world.step(this.timeStep)

    const playerSlotIds = Object.keys(this.players)

    playerSlotIds.forEach(slotId => {
      const player = this.players[slotId]

      if (player !== null) {
        player.update()
      }
    })
  }
}

module.exports = Game
