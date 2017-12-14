const p2 = require('p2')
const Bullet = require('./Bullet')
const { MASKS, GROUPS } = require('./collistion')

class Player {
  constructor (game, socket, x, y, collisionGroupId) {
    this.game = game
    this.world = game.world
    this.socket = socket
    this.speed = 200
    this.nextShootTime = game.world.time
    this.shootingRate = 0.1
    this.collisionGroupId = collisionGroupId
    this.hp = 100

    this.bullets = []

    this.initBody(x, y)

    this.input = {
      up: false,
      down: false,
      left: false,
      right: false,
      rotation: 0,
      leftButton: false
    }

    this.handlePlayerInput = this.handlePlayerInput.bind(this)

    socket.on('playerInput', this.handlePlayerInput)
  }

  initBody (x, y) {
    const { collisionGroupId } = this
    const shape = new p2.Circle({ radius: 10 })
    shape.collisionGroup = GROUPS[collisionGroupId]
    shape.collisionMask = MASKS[collisionGroupId]

    this.body = new p2.Body({
      mass: 1,
      position: [x, y],
      collisionResponse: false
    })

    this.body.addShape(shape)

    this.body.player = this
    this.body.gameEntityType = 'PLAYER'
  }

  handlePlayerInput (input) {
    const key = Object.keys(input)[0]
    this.input[key] = input[key]
  }

  update () {
    this.move()
    this.shoot()
    this.bullets.forEach(bullet => {
      bullet.update()
    })
  }

  checkCollision () {
    // const { game } = this
    //
    // game.players.forEach(({ socket, body }) => {
    //   const otherPlayerId = socket.id
    // })
  }

  shoot () {
    const { input, world, socket, collisionGroupId } = this

    if (input.leftButton) {
      if (world.time > this.nextShootTime) {
        this.nextShootTime = world.time + this.shootingRate

        const bulletCollisionGroupId = collisionGroupId.replace('PLAYER', 'BULLET')

        const bullet = new Bullet(this, input.rotation, bulletCollisionGroupId)
        this.bullets.push(bullet)
        world.addBody(bullet.body)

        const data = bullet.serialize()

        socket.emit('playerBulletInitialized', data)
        socket.broadcast.emit('enemyBulletInitialized', data)
      }
    }
  }

  move () {
    const { input, body, speed } = this

    body.velocity[0] = 0
    body.velocity[1] = 0

    if (input.up) {
      body.velocity[1] = -speed
    }

    if (input.right) {
      body.velocity[0] = speed
    }

    if (input.down) {
      body.velocity[1] = speed
    }

    if (input.left) {
      body.velocity[0] = -speed
    }

    if (input.down && input.right) {
      body.velocity[0] = Math.cos(0.25 * Math.PI) * speed
      body.velocity[1] = Math.sin(0.25 * Math.PI) * speed
    }

    if (input.down && input.left) {
      body.velocity[0] = Math.cos(0.75 * Math.PI) * speed
      body.velocity[1] = Math.sin(0.75 * Math.PI) * speed
    }

    if (input.up && input.right) {
      body.velocity[0] = Math.cos(-0.25 * Math.PI) * speed
      body.velocity[1] = Math.sin(-0.25 * Math.PI) * speed
    }

    if (input.up && input.left) {
      body.velocity[0] = Math.cos(-0.75 * Math.PI) * speed
      body.velocity[1] = Math.sin(-0.75 * Math.PI) * speed
    }

    if (body.position[0] < 0) {
      body.position[0] = 0
    }

    if (body.position[1] < 0) {
      body.position[1] = 0
    }

    if (body.position[0] > this.game.bounds.x) {
      body.position[0] = this.game.bounds.x
    }

    if (body.position[1] > this.game.bounds.y) {
      body.position[1] = this.game.bounds.y
    }

    const data = this.serialize()

    this.socket.emit('playerStateUpdate', data)
    this.socket.broadcast.emit('enemyStateUpdate', data)
  }

  hit (damage) {
    this.hp = this.hp - damage

    this.socket.emit('playerHit', { hp: this.hp })
    this.socket.broadcast.emit('enemyHit', { hp: this.hp, id: this.socket.id })

    console.log(this.socket.id, this.hp)

    if (this.hp <= 0) {
      this.kill()
    }
  }

  kill () {
    const { socket, world, body } = this

    world.removeBody(body)

    socket.emit('playerKilled')
    socket.broadcast.emit('enemyKilled', { id: this.socket.id })

    console.log(socket.id, 'killed')

    setTimeout(() => {
      this.respawn()
    }, 10000)
  }

  respawn () {
    const { body, world, socket } = this

    this.hp = 100

    body.position[0] = 50
    body.position[1] = 50

    world.addBody(body)

    console.log(socket.id, 'respawned')

    socket.emit('playerRespawned', this.serialize())
    socket.broadcast.emit('enemyRespawned', this.serialize())
  }

  serialize () {
    return {
      x: this.body.position[0],
      y: this.body.position[1],
      rotation: this.input.rotation,
      id: this.socket.id,
      hp: this.hp
    }
  }
}

module.exports = Player
