const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
// модуль ввода из командной строки
const pos = require('./pos')
const flags = require('./flags')
const Controller = require('./Controller')
const FL = "flag"
const KI = "kick"


const DT_Pandas1 = {
  state: {
      next: 0,
      sequence: [{act: "start"},
          {act: KI, fl: "b", goal: '"Pandas"'}, {act: "say", info: "go"}, {act: "wait", fl: "fplc"}, {act: "return"}],
      command: null,
      role: "main"
  },
  root: {
      exec(mgr, state) { state.action =
          state.sequence[state.next]; state.command = null },
      next: "rootStart",
  },
  rootStart: {
      condition: (mgr, state) => state.action.act == "start",
      trueCond: "hearPlayOn",
      falseCond: "rootFlag",
  },
  hearPlayOn: {
      condition: (mgr, state) => mgr.hear( "play_on"),
      trueCond: "next",
      falseCond: "wait",
  },
  wait: {
      exec(mgr,state) {state.command = {n: "dash", v: "0"}},
      next: "sendCommand"
  },
  rotate: {
      exec (mgr, state) { state.command = {n: "turn", v: "90"} },
      next: "sendCommand",
  },
  rootFlag: {
      condition: (mgr, state) => state.action.act == FL,
      trueCond: "flagSeek",
      falseCond: "rootBall",
  },
  rootBall: {
      condition: (mgr, state) => state.action.act == KI,
      trueCond: "ballSeek",
      falseCond: "rootSay"
  },
  rootSay: {
    condition: (mgr, state) => state.action.act == "say",
    trueCond: "sayGo",
    falseCond: "rootWait",
  },
  rootWait: {
      condition: (mgr, state) => state.action.act == "wait",
      trueCond: "waitResolve",
      falseCond: "rootReturn"
  },
  rootReturn: {
      exec(mgr, state) {state.command = {n: "move", v: "-10 0"};
      state.next = 0;},
      next: "sendCommand"
  },
  waitResolve: {
      condition: (mgr,state) => mgr.hear("goal_"),
      trueCond: "next",
      falseCond: "flagSeek"
  },
  flagSeek: {
      condition: (mgr, state) => mgr.getVisible(state.action.fl),
      trueCond: "flagDist",
      falseCond: "rotate",
  },
  flagDist: {
      condition: (mgr, state) => 3 >
          mgr.getDistance(state.action.fl),
      trueCond: "closeFlag",
      falseCond: "farGoal",
  },
  closeFlag: {
      condition: (mgr, state) => state.action.act == "wait",
      trueCond: "wait",
      falseCond: "next"
  },
  next: {
      exec(mgr, state)
      {state.next++; state.action = state.sequence[state.next]},
      next: "root",
  },
  sayGo: {
      exec(mgr,state) {state.command = {n: "say", v: "go"}; state.next++; state.action = state.sequence[state.next]},
      next: "sendCommand",
  },
  farGoal: {
      condition:
          (mgr, state) => mgr.getAngle(state.action.fl) != 0,
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
          (mgr, state) => mgr.getVisible(state.action.fl),
      trueCond: "ballDist",
      falseCond: "rotate",
  },
  ballDist: {
      condition:
          (mgr, state) => 0.5 > mgr.getDistance(state.action.fl),
      trueCond: "closeBall",
      falseCond: "farGoal",
  },
  closeBall: {
      condition:
          (mgr, state) => mgr.getVisiblePlayer(state.action.goal) !== false,
      trueCond: "ballGoalVisible",
      falseCond: "ballGoalInvisible",
  },
  ballGoalVisible: {
      exec (mgr, state) {
         console.log(mgr.getPLayerAngle(state.action.goal));
        state.command =
          {n: "kick", v: `65 ${mgr.getPLayerAngle(state.action.goal) -10}`}; state.next++; state.action = state.sequence[state.next]},
      next: "sendCommand",
  },
  ballGoalInvisible: {
      exec (mgr, state) {state.command = {n: "kick", v: "10 45"}},
      next: "sendCommand",
  },
}

const DT_Pandas2 = {
  state: {
      next: 0,
      sequence: [{act: "start"}, {act: "wait", fl: "fgrb", cmd: "go", source: '"Pandas"'},{act: KI, fl: "b", goal: "gr"}, {act: "return"}],
      command: null,
      role: "main"
  },
  root: {
      exec(mgr, state) { state.action =
          state.sequence[state.next]; state.command = null },
      next: "rootStart",
  },
  rootStart: {
      condition: (mgr, state) => state.action.act == "start",
      trueCond: "hearPlayOn",
      falseCond: "rootFlag",
  },
  hearPlayOn: {
      condition: (mgr, state) => mgr.hear("play_on"),
      trueCond: "next",
      falseCond: "wait",
  },
  wait: {
      exec(mgr,state) {state.command = {n: "dash", v: "0"}},
      next: "sendCommand"
  },
  rotate: {
      exec (mgr, state) { state.command = {n: "turn", v: "90"} },
      next: "sendCommand",
  },
  rootFlag: {
      condition: (mgr, state) => state.action.act == FL,
      trueCond: "flagSeek",
      falseCond: "rootBall",
  },
  rootBall: {
      condition: (mgr, state) => state.action.act == KI,
      trueCond: "ballCmd",
      falseCond: "rootWait"
  },

  rootWait: {
      condition: (mgr, state) => state.action.act == "wait",
      trueCond: "waitResolve",
      falseCond: "rootSeek"
  },
  rootSeek: {
      condition: (mgr, state) => state.action.act == "seek",
      trueCond: "seekResolve",
      falseCond: "rootReturn"
  },
  seekResolve: {
      condition: (mgr, state) => mgr.getVisible("b"),
      trueCond: "next",
      falseCond: "runToFlag",
  },
  runToFlag: {
      condition: (mgr, state) => mgr.getVisible(state.action.fl),
      trueCond: "runToGoal",
      falseCond: "rotate",
  },
  rootReturn: {
      exec(mgr, state) {state.command = {n: "move", v: `-20 20` }; console.log(state.command); state.next = 0;},
      next: "sendCommand"
  },
  waitResolve: {
      condition: (mgr,state) => mgr.hear(state.action.cmd),
      trueCond: "next",
      falseCond: "flagSeek"
  },
  flagSeek: {
      condition: (mgr, state) => mgr.getVisible(state.action.fl),
      trueCond: "flagDist",
      falseCond: "rotate",
  },
  flagDist: {
      condition: (mgr, state) => 10 >
          mgr.getDistance(state.action.fl),
      trueCond: "closeFlag",
      falseCond: "farGoal",
  },
  closeFlag: {
      condition: (mgr, state) => state.action.act == "wait",
      trueCond: "wait",
      falseCond: "next"
  },
  next: {
      exec(mgr, state)
      {state.next++; state.action = state.sequence[state.next]},
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
      exec (mgr, state) { state.command = {n: "dash", v: `65 ${mgr.getAngle(state.action.fl)}`} },
      next: "sendCommand",
  },
  sendCommand: {
      command: (mgr, state) => state.command
  },
  ballCmd: {
      condition:
          (mgr, state) => mgr.hear( "goal_"),
      trueCond: "next",
      falseCond: "ballSeek",
  },
  ballSeek: {
      condition:
          (mgr, state) => mgr.getVisible(state.action.fl),
      trueCond: "ballDist",
      falseCond: "rotate",
  },
  ballDist: {
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
          {n: "kick", v: `100 ${mgr.getAngle(state.action.goal)}`}},
      next: "sendCommand",
  },
  ballGoalInvisible: {
      exec (mgr, state) {state.command = {n: "kick", v: "10 45"}},
      next: "sendCommand",
  },
}

const DT_Polars = {
  state: {
      next: 0,
      sequence: [{act: "start"},{act: FL, fl: "fplb"}, {act: "wait", fl: "fgrb", cmd: "go", source: "Pandas"}, {act: "seek", fl: "fgrb"}, {act: KI, fl: "b", goal: "gr"}, {act: "return"}],
      command: null,
      role: "main"
  },
  root: {
      exec(mgr, state) { state.action =
          state.sequence[state.next]; state.command = null },
      next: "rootStart",
  },
  rootStart: {
      exec (mgr,state) {state.command = {n: "dash", v: 0}},
      next: "sendCommand",
  },
  sendCommand: {
      command: (mgr, state) => state.command
  },
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
    this.cmd = ''
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
          case "left": this.tree = DT_Pandas1;
                  break;
          case "right": this.tree = DT_Pandas2;
                  break;
          case "goalie":this.tree = DT_Polars;
      }
    } else {
      this.tree = DT_Polars;
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
    // Анализ сообщения
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
        this.act = this.manager.getAction(this.manager, this.tree, p, this.cmd)
        this.sendCmd()
      } 
    } else if(cmd == 'hear'){
      p.splice(0, 1)
      this.cmd = {cmd: "hear", source: p[0], info: p[1]}
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
