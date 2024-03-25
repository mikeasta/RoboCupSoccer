const Flags = {
  ftl50: {x: -50, y: 39}, ftl40: {x: -40, y: 39},
  ftl30: {x: -30, y: 39}, ftl20: {x: -20, y: 39},
  ftl10: {x: -10, y: 39}, ft0: {x: 0, y: 39},
  ftr10: {x: 10, y: 39}, ftr20: {x: 20, y: 39},
  ftr30: {x: 30, y: 39}, ftr40: {x: 40, y: 39},
  ftr50: {x: 50, y: 39}, fbl50: {x: -50, y: -39},
  fbl40: {x: -40, y: -39}, fbl30: {x: -30, y: -39},
  fbl20: {x: -20, y: -39}, fbl10: {x: -10, y: -39},
  fb0: {x: 0, y: -39}, fbr10: {x: 10, y: -39},
  fbr20: {x: 20, y: -39}, fbr30: {x: 30, y: -39},
  fbr40: {x: 40, y: -39}, fbr50: {x: 50, y: -39},
  flt30: {x:-57.5, y: 30}, flt20: {x:-57.5, y: 20},
  flt10: {x:-57.5, y: 10}, fl0: {x:-57.5, y: 0},
  flb10: {x:-57.5, y: -10}, flb20: {x:-57.5, y: -20},
  flb30: {x:-57.5, y: -30}, frt30: {x: 57.5, y: 30},
  frt20: {x: 57.5, y: 20}, frt10: {x: 57.5, y: 10},
  fr0: {x: 57.5, y: 0}, frb10: {x: 57.5, y: -10},
  frb20: {x: 57.5, y: -20}, frb30: {x: 57.5, y: -30},
  fglt: {x:-52.5, y: 7.01}, fglb: {x:-52.5, y:-7.01},
  gl: {x:-52.5, y: 0}, gr: {x: 52.5, y: 0}, fc: {x: 0, y: 0},
  fplt: {x: -36, y: 20.15}, fplc: {x: -36, y: 0},
  fplb: {x: -36, y:-20.15}, fgrt: {x: 52.5, y: 7.01},
  fgrb: {x: 52.5, y:-7.01}, fprt: {x: 36, y: 20.15},
  fprc: {x: 36, y: 0}, fprb: {x: 36, y:-20.15},
  flt: {x:-52.5, y: 34}, fct: {x: 0, y: 34},
  frt: {x: 52.5, y: 34}, flb: {x:-52.5, y: -34},
  fcb: {x: 0, y: -34}, frb: {x: 52.5, y: -34},
  distance(p1, p2) {
      return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2)
  },
}

function toRadians (angle) {
  return angle * (Math.PI / 180)
}

const getCoordsAPI = {
  checkangle(flag, a) {
      if (flag.angle > 0) {
          this.act = {n: "turn", v: a}
      }
      if (flag.angle < 0) {
          this.act = {n: "turn", v: -a}
      }
  },
  distanceBetween(flag1, flag2) {
      return Math.sqrt(Math.abs(
          Math.pow(flag1.dist,2) + Math.pow(flag2.dist,2) - 2 * flag1.dist * flag2.dist * Math.cos(toRadians(Math.abs(flag1.angle - flag2.angle)))))
  },

  findCoordinates(flags) {
      var x = undefined
      var y = undefined
      let d3 = undefined
      let x3 = undefined
      let y3 = undefined
      //// console.log(flags)
      if (flags.length < 2)
          return undefined
      const d1 = flags[0].dist
      const d2 = flags[1].dist

      const x1 = Flags[flags[0].name].x
      const x2 = Flags[flags[1].name].x

      const y1 = Flags[flags[0].name].y
      const y2 = Flags[flags[1].name].y


      if(flags.length >= 3) {
          d3 = flags[2].dist
          x3 = Flags[flags[2].name].x
          y3 = Flags[flags[2].name].y
      }

      return this.solveSystem(x1, y1, d1, x2, y2, d2, x3, y3, d3)

  },
  flagCoords(flag) {
      return Flags[flag]
  },
  solveX(x1, y1, d1, x2, y2, d2, x3, y3, d3) {
      const y = (y2 ** 2 - y1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (y2 - y1))
      let x = []
      x.push(x1 + Math.sqrt(Math.abs(d1 **2 - (y - y1)**2)))
      x.push(x1 - Math.sqrt(Math.abs(d1 **2 - (y - y1)**2)))
      if (x3 !== undefined && this.checkX(x[0]) && this.checkX(x[1])) {
          const delta_x_1 = Math.abs((x[0] - x3) ** 2 + (y - y3) ** 2 - d3 ** 2)
          const delta_x_2 = Math.abs((x[1] - x3) ** 2 + (y - y3) ** 2 - d3 ** 2)
          if (delta_x_1 - delta_x_2 > 0) {
              return {x: x[1], y: y}
          }
          return {x: x[0], y: y}
      }

      if(this.checkX(x[0])) {
          return {x: x[0], y: y}
      }
      return {x: x[1], y: y}
  },

  solveY(x1, y1, d1, x2, y2, d2, x3, y3, d3) {
      const x = (x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))
      let y = []
      y.push(y1 + Math.sqrt(Math.abs(d1 ** 2 - (x - x1)**2)))
      y.push(y1 - Math.sqrt(Math.abs(d1 ** 2 - (x - x1)**2)))

      if (x3 !== undefined && this.checkY(y[0]) && this.checkY(y[1])) {
          const delta_y_1 = Math.abs((x - x3) ** 2 + (y[0] - y3) ** 2 - d3 ** 2)
          const delta_y_2 = Math.abs((x - x3) ** 2 + (y[1] - y3) ** 2 - d3 ** 2)
          if (delta_y_1 - delta_y_2 > 0) {
              return {x: x, y: y[1]}
          }
          return {x: x, y: y[0]}
      }

      if(this.checkY(y[0])) {
          return {x: x, y: y[0]}
      }
      return {x: x, y: y[1]}
  },

  solveSystem(x1, y1, d1, x2, y2, d2, x3, y3, d3) {
      var x = undefined
      var y = undefined

      if (x1 === x2) {
          if (x3 === undefined) {
              return this.solveX(x1, y1, d1, x2, y2, d2)
          }
          return this.solveX(x1, y1, d1, x2, y2, d2, x3, y3, d3)
      }

      if (y1 === y2) {
          if (x3 === undefined) {
              return this.solveY(x1, y1, d1, x2, y2, d2)
          }
          return this.solveY(x1, y1, d1, x2, y2, d2, x3, y3, d3)
      }

      if (x1 === x3) {
          if (x2 === undefined) {
              return this.solveX(x1, y1, d1, x3, y3, d3)
          }
          return this.solveX(x1, y1, d1, x3, y3, d3, x2, y2, d2)
      }

      if (y1 === y3) {
          if (x2 === undefined) {
              return this.solveY(x1, y1, d1, x3, y3, d3)
          }
          return this.solveY(x1, y1, d1, x3, y3, d3, x2, y2, d2)
      }

      if (x2 === x3) {
          if (x1 === undefined) {
              return this.solveX(x2, y2, d2, x3, y3, d3)
          }
          return this.solveX(x2, y2, d2, x3, y3, d3, x1, y1, d1)
      }

      if (y2 === y3) {
          if (x1 === undefined) {
              return this.solveY(x2, y2, d2, x3, y3, d3)
          }
          return this.solveY(x2, y2, d2, x3, y3, d3, x1, y1, d1)
      }


      const alpha1 = (y1 - y2) / (x2 - x1)
      const beta1 = (y2 ** 2 - y1 ** 2 + x2 ** 2 - x1 ** 2 + d1 ** 2 - d2 ** 2) / (2 * (x2 - x1))

      if(x3 !== undefined && y3 !== undefined && d3 !== undefined) { //3 флага
          const alpha2 = (y1 - y3) / (x3 - x1)
          const beta2 = (y3 ** 2 - y1 ** 2 + x3 ** 2 - x1 ** 2 + d1 ** 2 - d3 ** 2) / (2 * (x3 - x1))

          y = (beta1 - beta2) / (alpha2 - alpha1)
          x = alpha1 * ((beta1 - beta2) / (alpha2 - alpha1)) + beta1

          return {x: x, y: y}
      } else { // 2 флага
          const a = alpha1 ** 2 + 1
          const b = -2 * (alpha1 * (x1 - beta1) + y1)
          const c = (x1 - beta1) ** 2 + y1 ** 2 - d1 ** 2

          y = (-b + Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)

          if (!this.checkY(y)) {
              y = (-b - Math.sqrt(b ** 2 - 4 * a * c)) / (2 * a)
          }

          x = x1 - Math.sqrt(d1 - (y - y1) ** 2)
          if (!this.checkX(x)) {
              x = x1 + Math.sqrt(d1 - (y - y1) ** 2)
          }

          return {x: x, y: y}
      }

  },

  checkY(y) {
      if (y >= -32 && y <= 32) {
          return true
      } else{
          return false
      }
  },

  checkX(x) {
      if (x >= -54 && x <= 54) {
          return true
      } else {
          return false
      }
  },

  findObjectCoordinates(object, playerCoordinates, flags) {
      const x = playerCoordinates.x
      const y = playerCoordinates.y
      const da = object.dist
      const alphaa = object.angle

      const x1 = Flags[flags[0].name].x
      const y1 = Flags[flags[0].name].y
      const d1 = flags[0].dist
      const alpha1 = flags[0].angle

      const da1 = Math.sqrt(d1 ** 2 + da ** 2 - 2 * d1 * da * Math.cos(Math.abs(toRadians(alpha1 - alphaa))))

      const x2 = Flags[flags[1].name].x
      const y2 = Flags[flags[1].name].y
      const d2 = flags[1].dist
      const alpha2 = flags[1].angle

      const da2 = Math.sqrt(d2 ** 2 + da ** 2 - 2 * d2 * da * Math.cos(Math.abs(toRadians(alpha2 - alphaa))))


      const objectCoordinates = this.solveSystem(x1, y1, da1, x2, y2, da2, x, y, da)
      return objectCoordinates;
  },

  findFlagByf(flags, flag_to_find){
      for (let flag of flags){
          if(flag.name === flag_to_find){
              return flag;
          }
      }
      return  null;
  }
}
module.exports = getCoordsAPI;