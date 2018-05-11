import {Vector} from "./vector.js"

class CollisionPhysics {
  constructor(){
    this.tempResponse = new CollisionResponse()
    this.collisionResponse = new CollisionResponse()
    this.rotateResult = 0.0
    this.pointLineResult = 0.0
  }
  pointIntersectsRectangleOuter(circle, rect, timeLimit) {
    this.collisionResponse.reset()  // Reset detected collision time to Number.MAX_SAFE_INTEGER
      // Right border
    this.pointIntersectsLineVertical(circle, (rect.x + rect.width), timeLimit, this.tempResponse)
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)
      // Left border
    this.pointIntersectsLineVertical(circle, rect.x, timeLimit, this.tempResponse)
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)
      // Top border
    this.pointIntersectsLineHorizontal(circle, rect.y, timeLimit, this.tempResponse)
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)
      // Bottom border
    this.pointIntersectsLineHorizontal(circle, rect.y + rect.height, timeLimit, this.tempResponse)
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)

      // FIXME: What if two collisions at the same time?? The CollisionResponse object keeps the result of one collision, not both!
  }
  pointIntersectsLineVertical(circle, lineX, timeLimit, response) {
    response.reset()
    if (circle.vector.x == 0) return
    const distance = lineX > circle.position.x ? lineX - circle.position.x - circle.r : lineX - circle.position.x + circle.r
    const t = distance / circle.vector.x  // circle.vector.x != 0
    if (t > 0 && t <= timeLimit) {
      response.t = t
      response.vector.x = -circle.vector.x  // Reflect horizontally
      response.vector.y = circle.vector.y   // No change vertically
    }
  }
  pointIntersectsLineHorizontal(circle, lineY, timeLimit, response) {
    response.reset()
    if (circle.vector.y == 0) return
    const distance = lineY > circle.position.y ? lineY - circle.position.y - circle.r : lineY - circle.position.y + circle.r
    const t = distance / circle.vector.y  // circle.vector.y != 0
      // Accept 0 < t <= timeLimit
    if (t > 0 && t <= timeLimit) {
      response.t = t
      response.vector.y = -circle.vector.y  // Reflect vertically
      response.vector.x = circle.vector.x   // No change horizontally
    }
  }
  pointIntersectsRectangleInner(circle, rect, timeLimit) {
    let impactY, impactX
    this.collisionResponse.reset()  // Reset detected collision time to Number.MAX_SAFE_INTEGER
      // Right border
    this.pointIntersectsLineVertical(circle, (rect.x + rect.width), timeLimit, this.tempResponse)
    impactY = this.tempResponse.getImpactY(circle.position.y, circle.vector.y)
    if (!(impactY >= rect.y && impactY <= (rect.y + rect.height) || impactY >= (rect.y + rect.height) && impactY <= rect.y)) {
      this.tempResponse.reset()  // no collision
    }
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)
      // Left border
    this.pointIntersectsLineVertical(circle, rect.x, timeLimit, this.tempResponse)
    impactY = this.tempResponse.getImpactY(circle.position.y, circle.vector.y)
    if (!(impactY >= rect.y && impactY <= (rect.y + rect.height) || impactY >= (rect.y + rect.height) && impactY <= rect.y)) {
      this.tempResponse.reset()  // no collision
    }
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)

      // Top border
    this.pointIntersectsLineHorizontal(circle, rect.y, timeLimit, this.tempResponse)
    impactX = this.tempResponse.getImpactX(circle.position.x, circle.vector.x)
    if (!(impactX >= rect.x && impactX <= (rect.x + rect.height) || impactX >= (rect.x + rect.height) && impactX <= rect.x)) {
      this.tempResponse.reset()  // no collision
    }
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)

      // Bottom border
    this.pointIntersectsLineHorizontal(circle, (rect.y+rect.height), timeLimit, this.tempResponse)
    impactX = this.tempResponse.getImpactX(circle.position.x, circle.vector.x)
    if (!(impactX >= rect.x && impactX <= (rect.x + rect.height) || impactX >= (rect.x + rect.height) && impactX <= rect.x)) {
      this.tempResponse.reset()  // no collision
    }
    if (this.tempResponse.t < this.collisionResponse.t) this.collisionResponse.copy(this.tempResponse)

    this.pointIntersectsPoint(circle, rect.x, rect.y, 0, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }

    this.pointIntersectsPoint(circle, rect.x, rect.y + rect.height, 0, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }

    this.pointIntersectsPoint(circle, rect.x + rect.width, rect.y, 0, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }

    this.pointIntersectsPoint(circle, rect.x + rect.width, rect.y + rect.height, 0, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }
  }

  pointIntersectsPolygon(circle, polygonXs, polygonYs, timeLimit) {
    let lineX1, lineX2, lineY1, lineY2
    const numPoints = Math.min(polygonXs.length, polygonYs.length)
    for (let segment = 0; segment < numPoints; segment++) {
      lineX1 = polygonXs[segment]
      lineY1 = polygonYs[segment]
      lineX2 = polygonXs[(segment + 1) % numPoints]
      lineY2 = polygonYs[(segment + 1) % numPoints]
      this.pointIntersectsLineSegmentNoEndPoints(circle, lineX1, lineY1, lineX2, lineY2, timeLimit)
      if (this.tempResponse.t < this.collisionResponse.t) {
        this.collisionResponse.copy(this.tempResponse)
      }
    }
      // Check each of the points that made up the polygon.
    for (let i = 0; i < numPoints; i++) {
      this.pointIntersectsPoint(circle, polygonXs[i], polygonYs[i], 0, timeLimit)
      if (this.tempResponse.t < this.collisionResponse.t) {
        this.collisionResponse.copy(this.tempResponse)
      }
    }
  }
  pointIntersectsLineSegmentNoEndPoints(circle, lineX1, lineY1, lineX2, lineY2, timeLimit) {
    if (lineX1 == lineX2) {  // If line is vertical or horizontal, use simplified solution.
      this.pointIntersectsLineVertical(circle, lineX1, timeLimit, this.tempResponse)
      const impactY = this.tempResponse.getImpactY(circle.position.y, circle.vector.y)
      if (!(impactY >= lineY1 && impactY <= lineY2 || impactY >= lineY2 && impactY <= lineY1)) {
        this.tempResponse.reset()  // no collision
      }
    } else if (lineY1 == lineY2) {
      this.pointIntersectsLineHorizontal(circle, lineY1, timeLimit, this.tempResponse)
      const impactX = this.tempResponse.getImpactX(circle.position.x, circle.vector.x)
      if (!(impactX >= lineX1 && impactX <= lineX2 || impactX >= lineX2 && impactX <= lineX1)) {
        this.tempResponse.reset()
      }
    }

    this.tempResponse.reset()  // Set detected collision time to Number.MAX_SAFE_INTEGER

      // Call helper method to compute the collision time.
    const result = this.pointIntersectsLineDetection(circle, lineX1, lineY1, lineX2, lineY2)
    const t = result[0]
    const lambda = result[1]

      // Accept 0 < t <= timeLimit
    if (t > 0 && t <= timeLimit && lambda >=0 && lambda <= 1) {
      this.pointIntersectsLineResponse(circle, lineX1, lineY1, lineX2, lineY2, t)
      if (this.tempResponse.t < this.collisionResponse.t) {
        this.collisionResponse.copy(this.tempResponse)
      }
    }

  }



  pointIntersectsLine(circle, lineX1, lineY1, lineX2, lineY2, timeLimit) {
    if (lineX1 == lineX2) {  // If line is vertical or horizontal, use simplified solution.
      this.pointIntersectsLineVertical(circle, lineX1, timeLimit)
      return
    } else if (lineY1 == lineY2) {
      this.pointIntersectsLineHorizontal(circle, lineY1, timeLimit)
      return
    }
    this.collisionResponse.reset()
    const t = this.pointIntersectsLineDetection(circle, lineX1, lineY1, lineX2, lineY2)[0]
    if (t > 0 && t <= timeLimit) {
      this.pointIntersectsLineResponse(circle, lineX1, lineY1, lineX2, lineY2, t)
      if (this.tempResponse.t < this.collisionResponse.t) {
        this.collisionResponse.copy(this.tempResponse)
      }
    }
    return
  }

  pointIntersectsLineDetection(circle, lineX1, lineY1, lineX2, lineY2) {

    const lineVectorX = lineX2 - lineX1
    const lineVectorY = lineY2 - lineY1

      // Compute the offset caused by circle.r
    let lineX1Offset = lineX1
    let lineY1Offset = lineY1

      // FIXME: Inefficient!
    if (circle.r > 0) {
         // Check which side of the line the point is. Offset reduces the distance
      const lineAngle = Math.atan2(lineVectorY, lineVectorX)
      const rotatedY = this.rotate(circle.position.x - lineX1, circle.position.y - lineY1, lineAngle)[1]
      if (rotatedY >  0) {
        lineX1Offset -= circle.r * Math.sin(lineAngle)
        lineY1Offset += circle.r * Math.cos(lineAngle)
      } else {
        lineX1Offset += circle.r * Math.sin(lineAngle)
        lineY1Offset -= circle.r * Math.cos(lineAngle)
      }
    }

      // Solve for t (time of collision) and lambda (point of impact on the line)
    let t
    let lambda
    const det = -circle.vector.x * lineVectorY + circle.vector.y * lineVectorX

    if (det == 0) {             // FIXME: Use a threshold?
      t = Number.MAX_SAFE_INTEGER    // No collision possible.
      lambda = Number.MAX_SAFE_INTEGER
    }

    const xDiff = lineX1Offset - circle.position.x
    const yDiff = lineY1Offset - circle.position.y
    t = (-lineVectorY * xDiff + lineVectorX * yDiff) / det
    lambda = (-circle.vector.y * xDiff + circle.vector.x * yDiff) / det

    const pointLineResult = []
    pointLineResult[0] = t
    pointLineResult[1] = lambda
    return pointLineResult
  }

  pointIntersectsLineResponse(circle, lineX1, lineY1, lineX2, lineY2, t) {
    this.tempResponse.t = t
      // Direction along the line of collision is P, normal is N.
      // Project velocity from (x, y) to (p, n)
    const lineAngle = Math.atan2(lineY2 - lineY1, lineX2 - lineX1)
    let result = this.rotate(circle.vector.x, circle.vector.y, lineAngle)
    const speedP = result[0]
    const speedN = result[1]
      // Reflect along the normal (N), no change along the line of collision (P)
    const speedPAfter = speedP
    const speedQAfter = -speedN
      // Project back from (p, n) to (x, y)
    result = this.rotate(speedPAfter, speedQAfter, -lineAngle)
    this.tempResponse.vector.x = result[0]
    this.tempResponse.vector.y = result[1]
  }



  pointIntersectsLineSegment(circle, lineX1, lineY1, lineX2, lineY2, timeLimit) {
    this.collisionResponse.reset()  // Reset the resultant response for earliest collision

      // Check the line segment for probable collision.
    this.pointIntersectsLineSegmentNoEndPoints(circle, lineX1, lineY1, lineX2, lineY2, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }
      // Check the two end points (with circle.r = 0) for probable collision
    this.pointIntersectsPoint(circle, lineX1, lineY1, 0, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }
    this.pointIntersectsPoint(circle, lineX2, lineY2, 0, timeLimit)
    if (this.tempResponse.t < this.collisionResponse.t) {
      this.collisionResponse.copy(this.tempResponse)
    }
  }
  pointIntersectsPoint(circle, p2X, p2Y, p2radius, timeLimit) {
    this.tempResponse.reset()
    const t = this.pointIntersectsMovingPointDetection(circle, p2X, p2Y, 0, 0, p2radius)
    if (t > 0 && t <= timeLimit) this.pointIntersectsPointResponse(circle, p2X, p2Y, t)
  }
  pointIntersectsPointResponse(circle, p2X, p2Y, t) {
    this.tempResponse.reset()
    this.tempResponse.t = t // Update collision time in response

      // Need to get the point of impact to form the line of collision.this.
    const p1ImpactX = this.tempResponse.getImpactX(circle.position.x, circle.vector.x)
    const p1ImpactY = this.tempResponse.getImpactY(circle.position.y, circle.vector.y)

      // Direction along the line of collision is P, normal is N.
      // Get the direction along the line of collision
    const lineAngle = Math.atan2(p2Y - p1ImpactY, p2X - p1ImpactX)

      // Project velocities from (x ,y) to (p, n)
    let result = this.rotate(circle.vector.x, circle.vector.y, lineAngle)
    const p1SpeedP = result[0]
    const p1SpeedN = result[1]

    if (p1SpeedP <= 0) {
      this.tempResponse.reset()  // No collision, keep moving.
      return
    }

    const p1SpeedPAfter = -p1SpeedP
    const p1SpeedNAfter = p1SpeedN

      // Project the velocities back from (p, n) to (x, y)
    result = this.rotate(p1SpeedPAfter, p1SpeedNAfter, -lineAngle)
    this.tempResponse.vector.x = result[0]
    this.tempResponse.vector.y = result[1]
  }

  pointIntersectsMovingPointDetection(circle, p2X, p2Y, p2SpeedX, p2SpeedY, p2Radius) {

     // Rearrange the parameters to set up the quadratic equation.
    const centerX = circle.position.x - p2X
    const centerY = circle.position.y - p2Y
    const speedX = circle.vector.x - p2SpeedX
    const speedY = circle.vector.y - p2SpeedY
    const radius = circle.r + p2Radius
    const radiusSq = radius * radius
    const speedXSq = speedX * speedX
    const speedYSq = speedY * speedY
    const speedSq = speedXSq + speedYSq

     // Solve quadratic equation for collision time t
    const termB2minus4ac = radiusSq * speedSq - (centerX * speedY - centerY * speedX) * (centerX * speedY - centerY * speedX)
    if (termB2minus4ac < 0) {
      return Number.MAX_SAFE_INTEGER
    }

    const termMinusB = -speedX * centerX - speedY * centerY
    const term2a = speedSq
    const rootB2minus4ac = Math.sqrt(termB2minus4ac)
    const sol1 = (termMinusB + rootB2minus4ac) / term2a
    const sol2 = (termMinusB - rootB2minus4ac) / term2a
     // Accept the smallest positive t as the solution.
    if (sol1 > 0 && sol2 > 0) {
      return Math.min(sol1, sol2)
    } else if (sol1 > 0) {
      return sol1
    } else if (sol2 > 0) {
      return sol2
    } else {
        // No positive t solution. Set detected collision time to infinity.
      return Number.MAX_SAFE_INTEGER
    }
  }
  pointIntersectsMovingPointResponse(circle, p2X, p2Y, t) {

     // Update the detected collision time in CollisionResponse.
    this.tempResponse.t = t

     // Get the point of impact, to form the line of collision.
    const p1ImpactX = this.tempResponse.getImpactX(circle.position.x, circle.vector.x)
    const p1ImpactY = this.tempResponse.getImpactY(circle.position.y, circle.vector.y)
    const p2ImpactX = this.tempResponse.getImpactX(p2X, 0)
    const p2ImpactY = this.tempResponse.getImpactY(p2Y, 0)

     // Direction along the line of collision is P, normal is N.
     // Get the direction along the line of collision
    const lineAngle = Math.atan2(p2ImpactY - p1ImpactY, p2ImpactX - p1ImpactX)

     // Project velocities from (x, y) to (p, n)
    let result = this.rotate(circle.vector.x, circle.vector.y, lineAngle)
    const p1SpeedP = result[0]
    const p1SpeedN = result[1]
    result = this.rotate(0, 0, lineAngle)
    const p2SpeedP = result[0]

    if (p1SpeedP - p2SpeedP <= 0) {
      this.tempResponse.reset()  // Set collision time to infinity
      return
    }

     // Assume that mass is proportional to the cube of radius.
     // (All objects have the same density.)
    const p1Mass = circle.r * circle.r * circle.r
    const p2Mass = p1Mass
    const diffMass = p1Mass - p2Mass
    const sumMass = p1Mass + p2Mass

     // Along the collision direction P, apply conservation of energy and momentum
    const p1SpeedPAfter = (diffMass * p1SpeedP + 2.0 * p2Mass * p2SpeedP) / sumMass

     // No change in the perpendicular direction N
    const p1SpeedNAfter = p1SpeedN

     // Project the velocities back from (p, n) to (x, y)
    result = this.rotate(p1SpeedPAfter, p1SpeedNAfter, -lineAngle)
    this.tempResponse.vector = new Vector(result[0], result[1])
    return
  }

  rotate(x, y, theta) {
    const sinTheta = Math.sin(theta)
    const cosTheta = Math.cos(theta)
    const rotateResult = []
    rotateResult[0] = x * cosTheta + y * sinTheta
    rotateResult[1] = -x * sinTheta + y * cosTheta
    return rotateResult
  }
  getSpeed(circle) {
    return Math.sqrt(circle.vector.x * circle.vector.x + circle.vector.y * circle.vector.y)
  }
}

export class CollisionResponse {
  constructor() {
    this.t = Number.MAX_SAFE_INTEGER
    this.T_EPSILON = 0.005
    this.vector = new Vector(0, 0)
    this.id = Math.floor(Math.random() * (100 - 1)) + 1
  }
  reset() {
    this.t = Number.MAX_SAFE_INTEGER
    this.vector = new Vector(0, 0)
  }
  copy(another) {
    this.t = another.t
    this.vector = another.vector.clone()
  }
  getNewX(currentX, speedX) {
    return this.t > this.T_EPSILON ? (currentX + speedX * (this.t - this.T_EPSILON)) : currentX
  }
  getNewY(currentY, speedY) {
    return this.t > this.T_EPSILON ? (currentY + speedY * (this.t - this.T_EPSILON)) : currentY
  }
  getImpactX(currentX, speedX) {
    return currentX + speedX * this.t
  }
  getImpactY(currentY, speedY) {
    return currentY + speedY * this.t
  }
}

export default new CollisionPhysics()
