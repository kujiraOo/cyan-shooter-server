class Player {
  constructor (socket, x, y) {
    this.socket = socket
    this.x = x
    this.y = y

    this.input = {
      up: false,
      down: false,
      left: false,
      right: false
    }

    this.handlePlayerInput = this.handlePlayerInput.bind(this)

    socket.on('playerInput', this.handlePlayerInput)
  }

  handlePlayerInput(input) {
    const key = Object.keys(input)[0]
    this.input[key] = input[key]
    console.log(this.input)
  }

  serialize() {
    return {
      x: this.x,
      y: this.y,
      id: this.socket.id
    }
  }
}

module.exports = Player
