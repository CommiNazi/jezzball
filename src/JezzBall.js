import {BrickField} from "./brick.js"
import {Balls, BallLine} from "./balls.js"
import {UI} from "./ui.js"

class Game {
  constructor(){
    this.pause = false
    this.mute  = false
    this.level = 0
    this.gameTime = 0

    //canvas
    this.canvas = document.createElement("canvas")
    this.canvas.id = "JEZZBALL"
    this.wallCanvas.classList.add("layer")
    this.ctx = this.canvas.getContext("2d")
    this.ctx.fillStyle = "black"
    this.ctx.font = "18px Zelda"
    this.ctx.textBaseline="middle"
    this.ctx.textAlign="center"

    this.wallCanvas = document.createElement("canvas")
    this.wallCanvas.id = "JEZZBALL_WALLS"
    this.wallCanvas.classList.add("layer")
    this.wallContext = this.wallCanvas.getContext("2d")
    this.wallContext.strokeStyle = "black"
    this.wallContext.lineWidth = 5

    document.body.appendChild(this.canvas)
    document.body.appendChild(this.wallCanvas)
  }
  render() {
    this.ctx.clear()
    this.field.draw(this.ctx)
    this.balls.draw(this.ctx)
    this.forecast.draw()
    this.uiManager.draw(this.ctx)
  }
  update(dt) {
    this.gameTime += dt
    const obstacles = this.field.rows.map(e=>e.row).reduce((a, b) => a.concat(b), []).filter(e=> e !== undefined)
    this.field.cleanup()
    this.field.move(dt)
    this.forecast.forecast(obstacles)

    this.balls.cleanup()

    if(this.balls.ballsOut > 0) this.balls.update(dt, obstacles)
  }
  newLevel() {
    this.level++
    this.balls.ballCount++
    this.field.addRow(this.level)
    this.forecast.on()
    this.balls.ballsOut = 0
    this.speed = this.opts.speed
    this.balls.resetR()
  }
  newGame() {
    this.gameOver()
    const opts = this.opts
    this.field = new BrickField(opts.rows, opts.columns, opts.brickHeight, opts.brickWidth, opts.brickMargin)
    this.balls = new Balls(opts.radius, this.field.width, this.field.height)
    this.uiManager = new UI(this.canvas.width, this.canvas.height)
    this.newLevel()
    this.pause = false
  }
  gameOver() {
    this.uiManager.gameOver()
    this.level = 0
    this.gameTime = 0
  }
  run(opts) {
    this.canvas.width =  opts.width
    this.canvas.height = opts.height

    this.wallCanvas.width = opts.width
    this.wallCanvas.height = opts.height
    this.wallContext.strokeRect(0, 0, opts.width, opts.height)

    this.EPSILON_TIME = opts.EPSILON //physics threshold

    //brick prep
    this.field = new BrickField(opts.rows, opts.columns, opts.brickHeight, opts.brickWidth, opts.brickMargin)
    this.brickHeight = opts.brickHeight
    this.brickWidth =  opts.brickWidth
    this.brickMargin = opts.brickMargin

    //ball prep
    this.balls = new Balls(opts.radius, this.field.width, this.field.height)
    this.forecast = new BallLine(this.length)
    this.length = opts.forecastLength
    this.speed = opts.speed
    this.attack = opts.attack

    // Turn on these lines to be able to hit the bricks by clicking on them.
    // utils.mouse = false
    // document.addEventListener("mousedown",  utils.mousedown, false)
    // document.addEventListener("mouseup",  utils.mouseup, false)
    // import {utils} from "./utils.js"
    // window.utils = utils


    window.game = game

    this.uiManager = new UI(this.canvas.width, this.canvas.height)

    this.now = performance.now()
    this.dt  = 0
    game.last = performance.now()
    function frame() {
      game.now = performance.now()
      game.dt = Math.min(1, (game.now - game.last) / 1000)
      if(!game.pause) {
        game.update(game.dt)

      }
      game.last = game.now
      game.render()
      requestAnimationFrame(frame, game.canvas)
    }
    this.newLevel()
    requestAnimationFrame(frame)
  }
}


const game = new Game()
export default game
