const flags = require('./flags')

module.exports = {
  twoFlags: function (pos_f1, d1, pos_f2, d2) {
    let alpha = (pos_f1.y - pos_f2.y) / (pos_f2.x - pos_f1.x)
    let beta =
      (pos_f2.y ** 2 -
        pos_f1.y ** 2 +
        pos_f2.x ** 2 -
        pos_f1.x ** 2 +
        d1 ** 2 -
        d2 ** 2) /
      (2 * (pos_f2.x - pos_f1.x))

    let a = alpha ** 2 + 1
    let b = -2 * (alpha * (pos_f1.x - beta) + pos_f1.y)
    let c = (pos_f1.x - beta) ** 2 + pos_f1.y ** 2 - d1 ** 2

    let y1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
    let y2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)

    let x1 = pos_f1.x + Math.sqrt(d1 ** 2 - (y1 - pos_f1.y) ** 2)
    let x2 = pos_f1.x + Math.sqrt(d1 ** 2 - (y2 - pos_f1.y) ** 2)
    let x3 = pos_f1.x - Math.sqrt(d1 ** 2 - (y1 - pos_f1.y) ** 2)
    let x4 = pos_f1.x - Math.sqrt(d1 ** 2 - (y2 - pos_f1.y) ** 2)
    // // console.log('y1: ', y1, ' x1: ', x1)
    // // console.log('y1: ', y1, ' x3: ', x3)
    // // console.log('y2: ', y2, ' x2: ', x2)
    // // console.log('y2: ', y2, ' x4: ', x4)
    if (y1 <= 39 && y1 >= -39) {
      if (x1 <= 57.5 && x1 >= -57.5) {
        return { x: x1, y: y1 }
      } else {
        return { x: x3, y: y1 }
      }
    } else {
      if (x2 <= 57.5 && x2 >= -57.5) {
        return { x: x2, y: y2 }
      } else {
        return { x: x4, y: y2 }
      }
    }
  },

  threeFlags: function (f1_str, d1, f2_str, d2, f3_str, d3) {
    let f1 = flags[f1_str]
    let f2 = flags[f2_str]
    let f3 = flags[f3_str]
    //// console.log('ffs: ', f1, f2, f3)

    let a1 = (f1.y - f2.y) / (f2.x - f1.x)
    let b1 =
      (f2.y ** 2 - f1.y ** 2 + f2.x ** 2 - f1.x ** 2 + d1 ** 2 - d2 ** 2) /
      (2 * (f2.x - f1.x))
    let a2 = (f1.y - f3.y) / (f3.x - f1.x)
    let b2 =
      (f3.y ** 2 - f1.y ** 2 + f3.x ** 2 - f1.x ** 2 + d1 ** 2 - d3 ** 2) /
      (2 * (f3.x - f1.x))

    let y = 0
    let x = 0
    if (f1.x == f2.x) {
      y = (f2.y ** 2 - f1.y ** 2 + d1 ** 2 - d2 ** 2) / (2 * (f2.y - f1.y))
    } else if (f1.x == f3.x) {
      y = (f3.y ** 2 - f1.y ** 2 + d1 ** 2 - d3 ** 2) / (2 * (f3.y - f1.y))
    } else if (f3.x == f2.x) {
      y = (f2.y ** 2 - f3.y ** 2 + d3 ** 2 - d2 ** 2) / (2 * (f2.y - f3.y))
    } else {
      y = (b1 - b2) / (a2 - a1)
    }

    if (f1.y == f2.y) {
      x = (f2.x ** 2 - f1.x ** 2 + d1 ** 2 - d2 ** 2) / (2 * (f2.x - f1.x))
    } else if (f1.y == f3.y) {
      x = (f3.x ** 2 - f1.x ** 2 + d1 ** 2 - d3 ** 2) / (2 * (f3.x - f1.x))
    } else if (f3.y == f2.y) {
      x = (f2.x ** 2 - f3.x ** 2 + d3 ** 2 - d2 ** 2) / (2 * (f2.x - f3.x))
    } else {
      x = (a1 * (b1 - b2)) / (a2 - a1) + b1
    }

    return { x: x, y: y }
  },

  twothreeFlags: function (f1, d1, f2, d2, f3, d3) {

    let alpha = (f1.y - f2.y) / (f2.x - f1.x)
    let beta =
      (f2.y * f2.y -
        f1.y * f1.y +
        f2.x * f2.x -
        f1.x * f1.x +
        d1 * d1 -
        d2 * d2) /
      (2 * (f2.x - f1.x))

    let a = alpha * alpha + 1
    let b = -2 * (alpha * (f1.x - beta) + f1.y)
    let c = (f1.x - beta) * (f1.x - beta) + f1.y * f1.y - d1 * d1

    let sols = []

    if (f1.x === f2.x) {
      let y =
        (f2.y * f2.y - f1.y * f1.y + d1 * d1 - d2 * d2) / (2 * (f2.y - f1.y))
      let x1 = f1.x + Math.sqrt(d1 * d1 - (y - f1.y) * (y - f1.y))
      let x2 = f1.x - Math.sqrt(d1 * d1 - (y - f1.y) * (y - f1.y))
      if(this.checkPos({ x: x1, y: y }))
        sols.push({ x: x1, y: y })
      if(this.checkPos({ x: x2, y: y }))
        sols.push({ x: x2, y: y })

    } else if (f1.y === f2.y) {
      let x =
        (f2.x * f2.x - f1.x * f1.x + d1 * d1 - d2 * d2) / (2 * (f2.x - f1.x))
      let y1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
      let y2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)
      if(this.checkPos({ x: x, y: y1 }))
        sols.push({ x: x, y: y1 })
      if(this.checkPos({ x: x, y: y2 }))
        sols.push({ x: x, y: y2 })

    } else {
      let y1 = (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a)
      let y2 = (-b - Math.sqrt(b * b - 4 * a * c)) / (2 * a)

      let x1 = f1.x + Math.sqrt(d1 * d1 - (y1 - f1.y) * (y1 - f1.y))
      let x2 = f1.x - Math.sqrt(d1 * d1 - (y1 - f1.y) * (y1 - f1.y))

      let x3 = f1.x + Math.sqrt(d1 * d1 - (y2 - f1.y) * (y2 - f1.y))
      let x4 = f1.x - Math.sqrt(d1 * d1 - (y2 - f1.y) * (y2 - f1.y))
      if(this.checkPos({ x: x1, y: y1 }))
        sols.push({ x: x1, y: y1 })
      if(this.checkPos({ x: x2, y: y1 }))
        sols.push({ x: x2, y: y1 })
      if(this.checkPos({ x: x3, y: y2 }))
        sols.push({ x: x3, y: y2 })
      if(this.checkPos({ x: x4, y: y2 }))
        sols.push({ x: x4, y: y2 })
    }
    let minimal = 1000
    let best_pair = { x: NaN, y: NaN }
    for (let i in sols) {
      let val = Math.abs(
        (sols[i].x - f3.x) ** 2 + (sols[i].y - f3.y) ** 2 - d3 * d3
      )
      if (val < minimal) {
        minimal = val
        best_pair = sols[i]
      }
    }
    return best_pair
  },

  getObjPos: function (p1, f1, d1, a1, f2, d2, a2, da, aa) {
    let da1 = Math.sqrt(
      d1 * d1 +
        da * da -
        2 * d1 * da * Math.cos((Math.abs(a1 - aa) * Math.PI / 180.0))
    )
    let da2 = Math.sqrt(
      d2 * d2 +
        da * da -
        2 * d2 * da * Math.cos((Math.abs(a2 - aa) * Math.PI / 180.0))
    )
    let new_p1 = {x: -p1.x, y: -p1.y}
    let new_f1 = {x: -f1.x, y: -f1.y}
    let new_f2 = {x: -f2.x, y: -f2.y}
    let coords = this.twothreeFlags(new_p1, da, new_f1, da1, new_f2, da2)
    return {x: -coords.x, y: -coords.y}
  },

  checkPos: function(pos) {
    return (pos.x >= -57.5 && pos.x <= 57.5 && pos.y >= -39 && pos.y <= 39)
  },


  getPlayerPos: function(f1, d1, a1, f2, d2, a2) {
    let right = (a2 < a1);
    let d = flags.distance(f1,f2)
    //radians
    let a = Math.acos((d2**2 - d1**2 - d*d) / (2*d1*d))
    let f = {x : (f2.x - f1.x) / d, y: (f2.y - f1.y) / d}

    let rot_f = {x: 0, y:0}
    if (right) {
      rot_f.x = f.x * Math.cos(a) - f.y * Math.sin(a)
      rot_f.y = f.x * Math.sin(a) + f.y * Math.cos(a)
    } else {
      rot_f.x = f.x * Math.cos(a) + f.y * Math.sin(a)
      rot_f.y = - f.x * Math.sin(a) + f.y * Math.cos(a)
    }

    rot_f.x *= d1;
    rot_f.y *= d1;
    rot_f.x += f1.x;
    rot_f.y += f1.y;

    return rot_f;

  }
  
}
