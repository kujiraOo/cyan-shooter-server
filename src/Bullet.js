const p2 = require('p2')
const uuid = require('uuid')
const { MASKS, GROUPS } = require('./collision')

class Bullet {
  constructor (player, angle, collisionGroupId) {
    this.player = player
    this.speed = 400
    this.angle = angle
    this.id = uuid()
    this.game = player.game
    this.world = player.world
    this.collisionGroupId = collisionGroupId
    this.damage = 20

    this.initBody()
  }

  initBody () {
    const { collisionGroupId, player, angle } = this
    const shape = new p2.Circle({ radius: 5 })
    shape.collisionGroup = GROUPS[collisionGroupId]
    shape.collisionMask = MASKS[collisionGroupId]

    this.body = new p2.Body({
      mass: 1,
      position: [...player.body.position],
      collisionResponse: false
    })

    this.body.velocity[0] = Math.cos(angle) * this.speed
    this.body.velocity[1] = Math.sin(angle) * this.speed

    this.body.addShape(shape)

    this.body.bullet = this
    this.body.gameEntityType = 'BULLET'
  }

  update () {
    const { player, body, game } = this

    if (body.position[0] < 0 || body.position[1] < 0 ||
      body.position[0] > game.bounds.x || body.position[1] > game.bounds.y) {
      this.destroy()
    } else {
      const data = this.serialize()
      player.socket.emit('playerBulletMove', data)
      player.socket.broadcast.emit('enemyBulletMove', data)
    }
  }

  destroy() {
    const { player, body, world } = this

    world.removeBody(body)
    player.bullets.splice(player.bullets.findIndex(bullet => this.id === bullet.id), 1)

    player.socket.emit('playerBulletRemoved', this.id)
    player.socket.broadcast.emit('enemyBulletRemoved', this.id)
  }

  serialize () {
    return {
      x: this.body.position[0],
      y: this.body.position[1],
      playerId: this.player.socket.id,
      id: this.id
    }
  }
}

module.exports = Bullet
