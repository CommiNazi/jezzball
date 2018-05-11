import game from "./JezzBall.js"
import "./style.css"

const opts = {
  speed: 30,
  radius: 8,
  EPSILON: 0.05,
  attack: 1,
  lives: 2,
  balls: 2,
  forecastLength: 10,
  width: 500,
  height: 250
}

game.run(opts)

CanvasRenderingContext2D.prototype.clear =
  CanvasRenderingContext2D.prototype.clear || function (preserveTransform) {
    if (preserveTransform) {
      this.save()
      this.setTransform(1, 0, 0, 1, 0, 0)
    }

    this.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (preserveTransform) {
      this.restore()
    }
  }

CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
  if (w < 2 * r) r = w / 2
  if (h < 2 * r) r = h / 2
  this.beginPath()
  this.moveTo(x+r, y)
  this.arcTo(x+w, y,   x+w, y+h, r)
  this.arcTo(x+w, y+h, x,   y+h, r)
  this.arcTo(x,   y+h, x,   y,   r)
  this.arcTo(x,   y,   x+w, y,   r)
  this.closePath()
  return this
}
