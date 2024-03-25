const Msg = require('./msg')
// Подключение модуля разбора сообщений от сервера
const readline = require('readline')
// модуль ввода из командной строки
const pos = require('./pos')
const flags = require('./flags')
const Controller = require('./Controller')
const FL = "flag"
const KI = "kick"
const Mgr = require('./Manager')

class Agent {
  constructor (teamName, init_x, init_y, pose) {
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
    if(this.pose == "goalie"){
      this.ta = require('./goalie')
    } else if(this.pose == "nothing"){
      this.ta = null
    } else {
      this.ta = require('./player')
    }
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
    if (data.cmd == 'hear' && data.p[1] == "referee") {
      this.run = true
      console.log(data.p[2])
      if(data.p[2] == 'play_on') {
        this.run = true
      }
    }
    
    if (data.cmd == 'init') 
      this.initAgent(data.p)
    this.analyzeEnv(data.msg, data.cmd, data.p)
  }

  initAgent (p) {
    if (p[0] == 'r') {
      this.position = 'r'
      this.other = 'l'
    } // Правая половина поля
    if (p[1]) this.id = p[1] // id игрока
  }

  analyzeEnv (msg, cmd, p) {
    // Анализ сообщения
    if (cmd == "see" && this.run) {
      this.act = Mgr.getAction(p, this.ta, this.teamName, this.position, false)
    }
  }

  sendCmd () {
    if (this.run) {
      // Игра начата
      if (this.act) {
        // Есть команда от игрока
        if (this.act.n == 'kick') {
          // Пнуть мяч
          this.socketSend(this.act.n, this.act.v + " " + this.act.a)
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
