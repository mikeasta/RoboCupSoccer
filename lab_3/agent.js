const Msg = require('./msg')
const readline = require('readline')
const pos = require('./pos')
const flags = require('./flags')
const Controller = require('./Controller')
const FL = "flag"
const KI = "kick"

const DT_pride = {
  state: {
      next: 0,
      sequence: [{act: KI, fl: "b", goal: "gr"}],
      command: null,
      role: "main"
  },
  root: {
      exec(mgr, state) { state.action =
          state.sequence[state.next]; state.command = null },
      next: "goalVisible",
  },
  goalVisible: {
      condition: (mgr, state) => mgr.getVisible(state.action.fl),
      trueCond: "rootNext",
      falseCond: "rotate",
  },

  rotate: {
      exec (mgr, state) { state.command = {n: "turn", v: "90"} },
      next: "sendCommand",
  },
  rootNext: {
      condition: (mgr, state) => state.action.act == FL,
      trueCond: "flagSeek",
      falseCond: "ballSeek",
  },
  flagSeek: {
      condition: (mgr, state) => 3 >
          mgr.getDistance(state.action.fl),
      trueCond: "closeFlag",
      falseCond: "farGoal",
  },
  closeFlag: {
      exec(mgr, state)
      {state.next = (state.next + 1) % state.sequence.length; state.action = state.sequence[state.next], console.log("111"+state.action.fl)},
      next: "root",
  },
  farGoal: {
      condition:
          (mgr, state) => Math.abs(mgr.getAngle(state.action.fl)) > 4,
      trueCond: "rotateToGoal",
      falseCond: "runToGoal",
  },
  rotateToGoal: {
      exec (mgr, state) { state.command = {n: "turn", v:
              mgr.getAngle(state.action.fl)} },
      next: "sendCommand",
  },
  runToGoal: {
      exec (mgr, state) { state.command = {n: "dash", v: 80} },
      next: "sendCommand",
  },
  sendCommand: {
      command: (mgr, state) => state.command
  },
  ballSeek: {
      condition:
          (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
      trueCond: "closeBall",
      falseCond: "farGoal",
  },
  closeBall: {
      condition:
          (mgr, state) => mgr.getVisible(state.action.goal),
      trueCond: "ballGoalVisible",
      falseCond: "ballGoalInvisible",
  },
  ballGoalVisible: {
      exec (mgr, state) { state.command =
          {n: "kick", v: `70 ${mgr.getAngle(state.action.goal)}`}},
      next: "sendCommand",
  },
  ballGoalInvisible: {
      exec (mgr, state) {state.command = {n: "kick", v: "10 45"}},
      next: "sendCommand",
  },
}

const DT_pride_2 = {
  state: {
      next: 0,
      sequence: [/*{act: FL, fl: "frb"}, {act: FL, fl: "gl"},*/
          {act: KI, fl: "b", goal: "gr"}],
      command: null,
      playerDist: 0,
      playerAngle: 0,
      role: "main"
  },
  root: {
      exec(mgr, state) { state.action =
          state.sequence[state.next]; state.command = null },
      next: "seekPlayer",
  },
  seekPlayer: {
      condition: (mgr,state) => mgr.getVisiblePlayer('"Pandas"', 1),
      trueCond: "init",
      falseCond: "seekAnyPlayer"
  },
  seekAnyPlayer: {
      condition: (mgr, state) => mgr.getVisiblePlayer('"Pandas"'),
      trueCond: "initAnyPlayer",
      falseCond: "rotate",
  },
  sendCommand: {
      command: (mgr, state) => state.command
  },
  rotate: {
      exec (mgr, state) { state.command = {n: "turn", v: "90"} },
      next: "sendCommand",
  },
  init: {
      exec(mgr,state) {state.playerDist = mgr.getPlayerDist('"Pandas"', 1); state.playerAngle = mgr.getPLayerAngle('"Pandas"', 1)},
      next: "playerClose",
  },
  initAnyPlayer: {
      exec(mgr,state) {state.playerDist = mgr.getPlayerDist('"Pandas"'); state.playerAngle = mgr.getPLayerAngle('"Pandas"')},
      next: "playerClose",
  },
  playerClose: {
      condition: (mgr,state) => state.playerDist < 1 && Math.abs(state.playerAngle) < 40,
      trueCond: "turn30",
      falseCond: "playerFar",
  },

  playerFar: {
      condition: (mgr, state) => state.playerDist > 10,
      trueCond: "farAngleCheck",
      falseCond: "closeAngleCheck",
  },
  farAngleCheck: {
      condition: (mgr, state) => Math.abs(state.playerAngle) > 50,
      trueCond: "turnPlayer",
      falseCond: "dash100",
  },
  closeAngleCheck: {
      condition: (mgr,state) => state.playerAngle > 40 || state.playerAngle < 25,
      trueCond: "turnMin30",
      falseCond: "distCheck",
  },
  distCheck: {
      condition: (mgr, state) => state.playerDist < 7,
      trueCond: "dash40",
      falseCond: "dash80"
  },
  turnPlayer: {
      exec(msg, state) {state.command = {n: "turn", v: state.playerAngle}},
      next: "sendCommand",
  },
  dash80: {
      exec(msg, state) {state.command = {n: "dash", v: 80}},
      next: "sendCommand"
  },
  dash100: {
      exec(msg, state) {state.command = {n: "dash", v: 100}},
      next: "sendCommand"
  },
  dash40: {
      exec(msg, state) {state.command = {n: "dash", v: 40}},
      next: "sendCommand"
  },
  turnMin30: {
      exec(msg, state) {state.command = {n: "turn", v: -30}},
      next: "sendCommand",
  },
  turn30: {
      exec(msg, state) {state.command = {n: "turn", v: 30}},
      next: "sendCommand",
  },
}

const DT_pride_3 = {
  state: {
      next: 0,
      sequence: [/*{act: FL, fl: "frb"}, {act: FL, fl: "gl"},*/
          {act: KI, fl: "b", goal: "gr"}],
      command: null,
      playerDist: 0,
      playerAngle: 0,
      role: "main"
  },
  root: {
      exec(mgr, state) { state.action =
          state.sequence[state.next]; state.command = null },
      next: "seekPlayer",
  },
  seekPlayer: {
      condition: (mgr,state) => mgr.getVisiblePlayer('"Pandas"', 1),
      trueCond: "init",
      falseCond: "seekAnyPlayer"
  },
  seekAnyPlayer: {
      condition: (mgr, state) => mgr.getVisiblePlayer('"Pandas"'),
      trueCond: "initAnyPlayer",
      falseCond: "rotate",
  },
  sendCommand: {
      command: (mgr, state) => state.command
  },
  rotate: {
      exec (mgr, state) { state.command = {n: "turn", v: "90"} },
      next: "sendCommand",
  },
  init: {
      exec(mgr,state) {state.playerDist = mgr.getPlayerDist('"Pandas"', 1); state.playerAngle = mgr.getPLayerAngle('"Pandas"', 1)},
      next: "playerClose",
  },
  initAnyPlayer: {
      exec(mgr,state) {state.playerDist = mgr.getPlayerDist('"Pandas"'); state.playerAngle = mgr.getPLayerAngle('"Pandas"')},
      next: "playerClose",
  },
  playerClose: {
      condition: (mgr,state) => state.playerDist < 1 && Math.abs(state.playerAngle) < 40,
      trueCond: "turnMin30",
      falseCond: "playerFar",
  },

  playerFar: {
      condition: (mgr, state) => state.playerDist > 10,
      trueCond: "farAngleCheck",
      falseCond: "closeAngleCheck",
  },
  farAngleCheck: {
      condition: (mgr, state) => Math.abs(state.playerAngle) > 50,
      trueCond: "turnPlayer",
      falseCond: "dash100",
  },
  closeAngleCheck: {
      condition: (mgr,state) => state.playerAngle < -40 || state.playerAngle > -25,
      trueCond: "turn30",
      falseCond: "distCheck",
  },
  distCheck: {
      condition: (mgr, state) => state.playerDist < 7,
      trueCond: "dash40",
      falseCond: "dash80"
  },
  turnPlayer: {
      exec(msg, state) {state.command = {n: "turn", v: state.playerAngle}},
      next: "sendCommand",
  },
  dash80: {
      exec(msg, state) {state.command = {n: "dash", v: 80}},
      next: "sendCommand"
  },
  dash100: {
      exec(msg, state) {state.command = {n: "dash", v: 100}},
      next: "sendCommand"
  },
  dash40: {
      exec(msg, state) {state.command = {n: "dash", v: 40}},
      next: "sendCommand"
  },
  turnMin30: {
      exec(msg, state) {state.command = {n: "turn", v: -30}},
      next: "sendCommand",
  },
  turn30: {
      exec(msg, state) {state.command = {n: "turn", v: 30}},
      next: "sendCommand",
  },
}

const DT_goalie = {
  state: {
      next: 0,
      sequence: [{act: "Goal", fl: "gr"}, {act: "Center", fl: "fprc"},
          {act: "Side", fl: "fprt"}, {act: "Side", fl: "fprb"}, {act: "Ball", fl: "b"}],
      command: null
  },
  root: {
      exec(mgr, state) { 
        //console.log("State.next: ", state.next)
        state.action =
          state.sequence[state.next]; state.command = null },
      next: "ballVisible",
  },
  ballVisible: {
      condition(mgr, state){
        //console.log("ballVisible")
        return (mgr.getVisible("b") && mgr.getDistance("b") < 5)
      },
      trueCond: "ballClose",
      falseCond: "goalSequence",
  },
  goalSequence: {
      condition(mgr, state){
        //console.log("goalSequence")
        return state.action.act == "Goal"
    },
      trueCond: "seekGoal",
      falseCond: "centerSequence"
  },
  seekGoal: {
      condition(mgr, state){
        //console.log("seekGoal")
        return mgr.getVisible(state.action.fl)
      },
      trueCond: "goalDist",
      falseCond: "rotate"
  },
  rotate: {
      exec (mgr, state) { 
        //console.log("rotate")
        state.command = {n: "turn", v: "90"} 
    },
      next: "sendCommand",
  },
  goalDist: {
      condition(mgr, state){
        //console.log("goalDist")
        return mgr.getDistance(state.action.fl) > 5
    },
      trueCond: "runToGoal",
      falseCond: "nextSeq"
  },
  runToGoal: {
      exec(mgr,state) {
        //console.log("runToGoal")
        state.command = {n: "dash", v: `100 ${mgr.getAngle(state.action.fl)}`}
    },
      next: "sendCommand"
  },
  goToGoal: {
      exec(mgr, state) {
        //console.log("goToGoal")
        state.command = {n: "dash", v: `30 ${mgr.getAngle(state.action.fl)}`}
    },
      next: "sendCommand"
  },
  sendCommand: {
      command(mgr, state){
        //console.log("sendCommand")
        return state.command
    }
  },
  nextSeq: {
      exec(mgr, state) {
        //console.log("nextSeq")
        state.next++; 
        state.action = state.sequence[state.next]; 
        //console.log(state.next+ "!!!!!!!") 
      },
      next: "wait",
  },
  centerSequence: {
      condition(mgr, state){
        //console.log("centerSequence")
        return state.action.act == "Center"
    },
      trueCond: "seekFlag",
      falseCond: "sideSequence"
  },
  seekFlag: {
      condition(mgr,state){
        //console.log("seekFlag")
        return mgr.getVisible(state.action.fl)
    },
      trueCond: "centerDist",
      falseCond: "rotate"
  },
  centerDist: {
      condition(mgr,state){
        //console.log("centerDist")
        //console.log(`${ mgr.getDistance(state.action.fl)}+++++++${state.action.fl}`) ;
      return mgr.getDistance(state.action.fl) > 12 && mgr.getDistance(state.action.fl) < 16},
      trueCond: "nextSeq",
      falseCond: "centerDistCheck",
  },
  centerDistCheck: {
      condition(mgr, state){
        //console.log("centerDistCheck")
        return mgr.getDistance(state.action.fl) <= 12
    },
      trueCond: "goBack", 
      falseCond: "goToGoal"
  },
  goBack: {
      exec(mgr, state) {
        //console.log("goBack")
        state.command = {n: "dash", v: `-20 ${mgr.getAngle(state.action.fl)}`}},
      next: "sendCommand"
  },
  sideSequence: {
      condition(mgr,state){
        //console.log("sideSequence")
        return state.action.act == "Side"},
      trueCond: "seekSide",
      falseCond: "ballSequence"
  },
  seekSide: {
      condition(mgr, state){
        //console.log("seekSide")
        return mgr.getVisible(state.action.fl)
    },
      trueCond: "sideDist",
      falseCond: "rotate"
  },
  sideDist: {
      condition(mgr,state){
        //console.log("sideDist")
        //console.log(`${ mgr.getDistance(state.action.fl)}+++++++${state.action.fl}`) ;
        return mgr.getDistance(state.action.fl) > 20 && mgr.getDistance(state.action.fl) < 28},
      trueCond: "nextSeq",
      falseCond: "sideDistCheck",
  },
  sideDistCheck: {
      condition(mgr,state){
        //console.log("sideDistCheck")
        return mgr.getDistance(state.action.fl) <= 20},
      trueCond: "goBack",
      falseCond: "goToGoal"
  },
  ballSequence: {
      condition(mgr,state){
        //console.log("ballSequence")
        return mgr.getVisible("b")},
      trueCond: "ballDist",
      falseCond: "rotate",
  },
  ballDist: {
      condition(mgr,state){ 
        //console.log("ballDist"); 
        return mgr.getDistance(state.action.fl) < 15},
      trueCond: "ballClose",
      falseCond: "wait"
  },
  wait: {
      exec(mgr,state) {
        //console.log("wait");
        state.command = {n:"dash", v: 0}},
      next: "sendCommand"
  },
  ballClose: {
      condition(mgr, state){
        //console.log("ballClose"); 
        return mgr.getDistance("b") < 2},
      trueCond: "closeDist",
      falseCond: "goToBall"
  },
  closeDist: {
      condition(mgr, state){
        //console.log("closeDist"); 
        return mgr.getDistance("b") < 2},
      trueCond: "goalDir",
      falseCond: "catchBall"
  },
  catchBall: {
    exec(mgr,state){
      //console.log("catchBall"); 
      state.command = {n: "catch", v: mgr.getAngle("b")}},
    next: "sendCommand"
  },
  goToBall: {
      exec(mgr,state) {
        //console.log("goToBall"); 
        state.command = {n: "dash", v: `100 ${mgr.getAngle("b")}`}},
      next: "sendCommand"
  },

  goalDir: {
      condition(mgr,state){
        //console.log("goalDir"); 
        return mgr.getVisible("gr") == false},
      trueCond: "kickBall",
      falseCond: "rotateBall",
  },

  kickBall: {
      exec(mgr, state) {
        //console.log("kickBall"); 
        state.command = {n: "kick", v: `100 ${mgr.getAngle("gl")}`}},
      next: "sendCommand",
  },

  rotateBall: {
      exec (mgr, state) {
        //console.log("rotateBall"); 
        state.command = {n: "kick", v: "10 45"}; state.next = state.sequence.length-1},
      next: "sendCommand",
  }
}


class Agent {
  constructor (teamName,manager, init_x, init_y, pose) {
    this.manager = manager
    this.pose = pose
    this.init_x = init_x
    this.init_y = init_y
    this.position = 'l' // По умолчанию - левая половина поля
    this.other = 'r'
    this.run = false // Игра начата
    this.act = null // Действия
    this.play_on = false
    this.turn_moment = 0
    this.coords = {x: NaN, y: NaN}
    this.teamName = teamName
  }

  msgGot (msg) {
    // Получение сообщения
    let data = msg.toString('utf8') // Приведение к строке
    this.processMsg(data) // Разбор сообщения
    this.sendCmd() // Отправка команды
  }

  setSocket (socket) {
    // Настройка сокета
    this.socket = socket
  }

  socketSend (cmd, value) {
    // Отправка команды
    this.socket.sendMsg(`(${cmd} ${value})`)
  }

  processMsg (msg) {
    // Обработка сообщения
    let data = Msg.parseMsg(msg)
    if (!data) throw new Error('Parse error\n' + msg)
    // Первое (hear) - начало игры
    if (data.cmd == 'hear') {
      this.run = true
      //console.log(data.p[2])
      if(data.p[2] == 'play_on') {
        this.play_on = true
      } else if(data.p[2] == 'kick_off_l'){
          //this.socketSend('kick', '60 0')
          return
        } else if(data.p[2].startsWith('goal_l')){
            this.socketSend('move', this.init_x + ' ' + this.init_y)
          } else if(data.p[2].startsWith('drop_ball')){
           // this.controller.refresh()
          }
      }
    
    if (data.cmd == 'init') this.initAgent(data.p)
    this.analyzeEnv(data.msg, data.cmd, data.p)
  }

  initAgent (p) {
    if (p[0] == 'r') {
      this.position = 'r'
      this.other = 'l'
    } // Правая половина поля
    if (p[1]) this.id = p[1] // id игрока
    if (this.teamName === 'Pandas') {
      switch (this.pose) {
          case "middle": this.tree = DT_pride; break;
          case "left": this.tree = DT_pride_2; break;
          case "right":this.tree = DT_pride_3; break;
      }
    } else {
      this.tree = DT_goalie;
    }
  }

  bestPos(flgs, p) {
    let pairs_count = 0
    let sum = {x: 0, y: 0};
    
    for(let i = 0; i < flgs.length-2; i++){
      for(let j = i+1; j < flgs.length-1; j++){
        for(let k = j+1; k < flgs.length; k++){
          let f1 = p[flgs[i]]['cmd']['p'].join('')
          let d1 = p[flgs[i]]['p'][0]
          let alpha1 = p[flgs[i]]['p'][1]
          let f2 = p[flgs[j]]['cmd']['p'].join('')
          let d2 = p[flgs[j]]['p'][0]
          let alpha2 = p[flgs[j]]['p'][1]
          let f3 = p[flgs[k]]['cmd']['p'].join('')
          let d3 = p[flgs[k]]['p'][0]
          let coords = pos.twothreeFlags(flags[f1], d1, flags[f2], d2, flags[f3], d3)
          if(!isNaN(coords.x) && !isNaN(coords.y)){
            sum.x += coords.x;
            sum.y += coords.y;
            pairs_count += 1;
          }
        }
      }
    }
    sum.x /= pairs_count
    sum.y /= pairs_count
    return sum
  }

  bestObjPos(flgs, coords, p){
    let res = []
    // iterate all people at view
    for (let m = 1; m < p.length; m++) {
      if (
        p[m]['cmd']['p'][0] == 'p' &&
        p[m]['cmd']['p'][1] != this.teamName
      ){
        let p_d = p[m]['p'][0]
        let p_alpha = p[m]['p'][1]
        let pairs_count = 0
        let sum = {x: 0, y: 0};
        // find coords of each
        for(let i = 0; i < flgs.length-1; i++){
          for(let j = i+1; j < flgs.length; j++){
            let f1 = p[flgs[i]]['cmd']['p'].join('')
            let d1 = p[flgs[i]]['p'][0]
            let alpha1 = p[flgs[i]]['p'][1]
            let f2 = p[flgs[j]]['cmd']['p'].join('')
            let d2 = p[flgs[j]]['p'][0]
            let alpha2 = p[flgs[j]]['p'][1]

            let coords_enemy = pos.getObjPos(coords, flags[f1], d1, alpha1, flags[f2], d2, alpha2, p_d, p_alpha)
            if(!isNaN(coords_enemy.x) && !isNaN(coords_enemy.y)){
              sum.x += coords_enemy.x;
              sum.y += coords_enemy.y;
              pairs_count += 1;
            }
          }
        }
        sum.x /= pairs_count
        sum.y /= pairs_count
        res.push(sum)
      }
    }
    return res
  }


  analyzeEnv (msg, cmd, p) {
    if (cmd == 'see') {
      let counter = 0
      let flgs = []
      let ball_idx = -1
      let p_idx = -1
      for (let i = 1; i < p.length; i++) {
        if (p[i]['cmd']['p'][0] === 'f') {
          flgs.push(i)
        } else if(p[i]['cmd']['p'][0] === 'b'){
          ball_idx = i
        } else if(p[i]['cmd']['p'][0] === 'p'){
          p_idx = i
        }
      }
      this.coords = this.bestPos(flgs, p)
      flgs.push(p_idx)
      if (this.play_on == true) {
        this.act = this.manager.getAction(this.manager, this.tree, p)
        this.sendCmd()
      } 
    }
  }

  sendCmd () {
    if (this.run) {
      // Игра начата
      if (this.act) {
        // Есть команда от игрока
        if (this.act.n == 'kick') {
          // Пнуть мяч
          this.socketSend(this.act.n, this.act.v)
        } else {
          // Движение и поворот
          this.socketSend(this.act.n, this.act.v)
        }
      }
      this.act = null // Сброс команды
    }
  }
}

module.exports = Agent // Экспорт игрока