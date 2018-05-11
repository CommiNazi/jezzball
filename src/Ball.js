Math.seededRandom = function(max, min) {
  max = max || 1
  min = min || 0
  Math.seed = (Math.seed * 9301 + 49297) % 233280
  const rnd = Math.seed / 233280.0
  return Math.round(min + rnd * (max - min))
}

Math.seed = 1

class Vector {
  constructor(obj) {
    this.x = obj.x
    this.y = obj.y
  }
  eq(vector) {
    return this.x == vector.x && this.y == vector.y
  }
  set(vector) {
    this.x = vector.x
    this.y = vector.y
  }
  mult(vector) {
    this.x *= vector.x
    this.y *= vector.y
  }
}

const UPRIGHT   = new Vector({x: 1, y:-1})
const DOWNRIGHT = new Vector({x: 1, y: 1})
const UPLEFT    = new Vector({x:-1, y:-1})
const DOWNLEFT  = new Vector({x:-1, y: 1})

const ranDir = ()=>{
  const arr = [UPRIGHT, DOWNRIGHT, UPLEFT, DOWNLEFT]
  return arr[Math.seededRandom(0,3)]
}

class Wall {
  constructor(x,y,width,height,color) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
  }
  draw(ctx) {
    ctx.fillStyle = this.color
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Ball {
  constructor(radius, x, y, speed, color) {
    this.r = radius
    this.x = x
    this.y = y
    this.speed = speed
    this.color = color
    this.vector = new Vector(ranDir())
  }
  draw(ctx) {
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x,this.y,this.r,0,2*Math.PI)
    ctx.fill()
  }
  update(dt, balls, line, walls, edges) {
    this.checkEdges(edges)
    this.checkBalls(balls)
    this.checkWalls(walls)
    this.x += this.vector.x*this.speed*dt
    this.y += this.vector.y*this.speed*dt
  }
  checkEdges(edges) {
    if (this.x - this.r < 0 || this.x + this.r > edges.width)
      this.vector.x *= -1
    if (this.y - this.r < 0 || this.y + this.r > edges.height)
      this.vector.y *= -1
  }
  checkWall(wall) {
    // return true if the rectangle and circle are colliding
    const distX = Math.abs(this.x - wall.x-wall.width/2)
    const distY = Math.abs(this.y - wall.y-wall.height/2)

    if (distX > (wall.width/2 + this.r)) { return false }
    if (distY > (wall.height/2 + this.r)) { return false }

    if (distX <= (wall.width/2)) { return true }
    if (distY <= (wall.height/2)) { return true }

    const dx=distX-wall.width/2
    const dy=distY-wall.height/2
    return (dx*dx+dy*dy<=(this.r*this.r))
  }
  bounce (rect) {
    // compute a center-to-center vector
    const half = {
      x: rect.width/2,
      y: rect.height/2
    }
    const center = {
      x: this.x - (rect.x+half.x),
      y: this.y - (rect.y+half.y)
    }

    // check circle position inside the rectangle quadrant
    const side = {
      x: Math.abs (center.x) - half.x,
      y: Math.abs (center.y) - half.y
    }

    if (side.x >  this.r || side.y >  this.r) // outside
      return { bounce: false }
    if (side.x < -this.r && side.y < -this.r) // inside
      return { bounce: false }
    if (side.x < 0 || side.y < 0) { // intersects side or corner
      let dx = 1
      let dy = 1
      if (Math.abs (side.x) < this.r && side.y < 0) {
        dx = center.x*side.x < 0 ? -1 : 1
      } else if (Math.abs (side.y) < this.r && side.x < 0) {
        dy = center.y*side.y < 0 ? -1 : 1
      }
      return { bounce: true, x:dx, y:dy }
    }
    // circle is near the corner
    const bounce = side.x*side.x + side.y*side.y  < this.r*this.r
    if (!bounce) return { bounce:false }

    // const norm = Math.sqrt (side.x*side.x+side.y*side.y)
    const dx = center.x < 0 ? -1 : 1
    const dy = center.y < 0 ? -1 : 1
    return { bounce: true, x:dx, y:dy }
  }
  checkWalls(walls) {
    const that = this
    walls.forEach(wall=>{
      if(this.checkWall(wall)) {
        const response = that.bounce(wall)
        if(response.x === 0 || response.y === 0)
          console.error("why erorr?",response)
        if(response.bounce) {
          this.vector.mult(response)
        }
      }
    })
  }
  checkDistance(position) {
    return Math.sqrt((position.x - this.x)**2 + (position.y - this.y)**2)
  }
  checkBalls(balls, startingIndex=0) {
    const len = balls.length
    for (let i = startingIndex; i < len; i++) {
      const distance = this.checkDistance(balls[i])
      if (distance < (this.r * 2)) {
        const UPRIGHT   = new Vector({x: 1, y:-1})
        const DOWNRIGHT = new Vector({x: 1, y: 1})
        const UPLEFT    = new Vector({x:-1, y:-1})
        const DOWNLEFT  = new Vector({x:-1, y: 1})
        if (this.vector.eq(DOWNRIGHT) && balls[i].vector.eq(DOWNRIGHT)){
          balls[i].vector.set(UPLEFT)
        } else if (this.vector.eq(DOWNRIGHT) && balls[i].vector.eq(UPRIGHT)) {
          this.vector.set(UPRIGHT)
          balls[i].vector.set(DOWNRIGHT)
        }
        else if (this.vector.eq(DOWNRIGHT) && balls[i].vector.eq(DOWNLEFT)) {
          this.vector.set(DOWNLEFT)
          balls[i].vector.set(DOWNRIGHT)
        }
        else if (this.vector.eq(DOWNRIGHT) && balls[i].vector.eq(UPLEFT)) {
          this.vector.set(UPLEFT)
          balls[i].vector.set(DOWNRIGHT)
        }
        else if (this.vector.eq(UPRIGHT) && balls[i].vector.eq(DOWNRIGHT)) {
          this.vector.set(DOWNRIGHT)
          balls[i].vector.set(UPRIGHT)
        }
        else if (this.vector.eq(UPRIGHT) && balls[i].vector.eq(UPRIGHT)) {
          this.vector.set(UPRIGHT)
          balls[i].vector.set(DOWNLEFT)
        }
        else if (this.vector.eq(UPRIGHT) && balls[i].vector.eq(DOWNLEFT)) {
          this.vector.set(DOWNLEFT)
          balls[i].vector.set(UPRIGHT)
        }
        else if (this.vector.eq(UPRIGHT) && balls[i].vector.eq(UPLEFT)) {
          this.vector.set(UPLEFT)
          balls[i].vector.set(UPRIGHT)
        }
        else if (this.vector.eq(DOWNLEFT) && balls[i].vector.eq(DOWNRIGHT)) {
          this.vector.set(DOWNRIGHT)
          balls[i].vector.set(DOWNLEFT)
        }
        else if (this.vector.eq(DOWNLEFT) && balls[i].vector.eq(UPRIGHT)) {
          this.vector.set(UPRIGHT)
          balls[i].vector.set(DOWNLEFT)
        }
        else if (this.vector.eq(DOWNLEFT) && balls[i].vector.eq(DOWNLEFT)) {
          this.vector.set(UPRIGHT)
          balls[i].vector.set(UPRIGHT)
        }
        else if (this.vector.eq(DOWNLEFT) && balls[i].vector.eq(UPLEFT)) {
          this.vector.set(UPLEFT)
          balls[i].vector.set(DOWNLEFT)
        }
        else if (this.vector.eq(UPLEFT) && balls[i].vector.eq(DOWNRIGHT)) {
          this.vector.set(DOWNRIGHT)
          balls[i].vector.set(UPLEFT)
        }
        else if (this.vector.eq(UPLEFT) && balls[i].vector.eq(UPRIGHT)) {
          this.vector.set(UPRIGHT)
          balls[i].vector.set(UPLEFT)
        }
        else if (this.vector.eq(UPLEFT) && balls[i].vector.eq(DOWNLEFT)) {
          this.vector.set(DOWNLEFT)
          balls[i].vector.set(UPLEFT)
        }
        else if (this.vector.eq(UPLEFT) && balls[i].vector.eq(UPLEFT)) {
          balls[i].vector.set(DOWNRIGHT)
        }
      }
    }
  }
}

const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
const ball1 = new Ball(8, Math.seededRandom(0,canvas.width), Math.seededRandom(0,canvas.height), 300, "red")
const ball2 = new Ball(8, Math.seededRandom(0,canvas.width), Math.seededRandom(0,canvas.height), 300, "blue")
const ball3 = new Ball(8, Math.seededRandom(0,canvas.width), Math.seededRandom(0,canvas.height), 300, "green")
const ball4 = new Ball(8, Math.seededRandom(0,canvas.width), Math.seededRandom(0,canvas.height), 300, "purple")
const wall1 = new Wall((canvas.width/2)|0, 0, 10, canvas.height, "yellow")

function drawCanvas() {
  ctx.lineWidth = 5
  ctx.strokeStyle = "green"
  ctx.strokeRect(0, 0, canvas.width, canvas.height)

  let last = performance.now()
  const step     = 1/60
  let dt = 0

  function frame(now) {
    dt = Math.min(.2, dt + Math.min(1, (now - last) / 1000))
    while(dt > step) {
      dt = dt - step
      ball1.update(dt, [ball2, ball3, ball4], [], [wall1], canvas)
      ball2.update(dt, [ball1, ball3, ball4], [], [wall1], canvas)
      ball3.update(dt, [ball1, ball2, ball4], [], [wall1], canvas)
      ball4.update(dt, [ball1, ball2, ball3], [], [wall1], canvas)
    }
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height)
    ctx.strokeRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ball1.draw(ctx)
    ball2.draw(ctx)
    ball3.draw(ctx)
    ball4.draw(ctx)
    wall1.draw(ctx)
    last = now
    requestAnimationFrame(frame)
  }
  frame(performance.now())
}

window.addEventListener("load", drawCanvas)
