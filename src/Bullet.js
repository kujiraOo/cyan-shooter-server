const p2 = require('p2')
const uuid = require('uuid')

class Bullet {
  constructor (player, angle) {
    this.player = player
    this.speed = 400
    this.angle = angle
    this.id = uuid()
    this.game = player.game
    this.world = player.world

    this.body = new p2.Body({
      mass: 1,
      position: [...player.body.position],
      collisionResponse: false
    })

    this.body.velocity[0] = Math.cos(angle) * this.speed
    this.body.velocity[1] = Math.sin(angle) * this.speed

    this.body.addShape(new p2.Circle({ radius: 5 }))
  }

  update () {
    const { player, body, game, world } = this

    if (body.position[0] < 0 || body.position[1] < 0 ||
      body.position[0] > game.bounds.x || body.position[1] > game.bounds.y) {
      world.removeBody(body)
      player.bullets.splice(player.bullets.findIndex(bullet => this.id === bullet.id), 1)

      player.socket.emit('playerBulletRemoved', this.id)
      player.socket.broadcast.emit('enemyBulletRemoved', this.id)
    } else {
      const data = this.serialize()
      player.socket.emit('playerBulletMove', data)
      player.socket.broadcast.emit('enemyBulletMove', data)
    }
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
