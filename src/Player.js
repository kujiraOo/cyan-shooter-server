const p2 = require('p2')
const Bullet = require('./Bullet')

class Player {
  constructor (game, socket, x, y) {
    this.game = game
    this.world = game.world
    this.socket = socket
    this.speed = 200
    this.nextShootTime = game.world.time
    this.shootingRate = 0.5

    this.bullets = []

    this.body = new p2.Body({
      mass: 1,
      position: [x, y],
      collisionResponse: false
    })

    this.body.addShape(new p2.Circle({ radius: 10 }))

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

  shoot() {
    const {input, world, socket} = this

    if (input.leftButton) {
      if (world.time > this.nextShootTime) {
        this.nextShootTime = world.time + this.shootingRate

        const bullet = new Bullet(this, input.rotation)
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

    const data = {
      x: body.position[0],
      y: body.position[1],
      rotation: input.rotation
    }

    this.socket.emit('playerStateUpdate', data)
    this.socket.broadcast.emit('enemyStateUpdate', data)
  }

  serialize () {
    return {
      x: this.body.position[0],
      y: this.body.position[1],
      id: this.socket.id
    }
  }
}

module.exports = Player
