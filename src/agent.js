const Msg = require('./msg')
const readline = require('readline')
class Agent {
    constructor() {
        this.position = "l" // По умолчанию левая половина поля
        this.run = false // Игра начата
        this.act = null // Действия

        this.rl = readline.createInterface({ // Чтение консоли
            input: process.stdin,
            output: process.stdout
        })

        this.rl.on('line', (input) => {  // Обработка строки из консоли
            if(this.run) { // Если игра начата движения вперед, вправо, влево, удар по мячу
                if("w" == input) this.act = {n: "dash", v: 100}
                if("d" == input) this.act = {n: "turn", v: 20}
                if("a" == input) this.act = {n: "turn", v: -20}
                if("s" == input) this.act = {n: "kick", v: 100}
        }
        })
    }

    // Получение сообщения
    msgGot(msg) { 
        let data = msg.toString('utf8') // ПРиведение
        this.processMsg(data) // Разбор сообщения
        this.sendCmd() // Отправка команды
    }

    // Настройка сокета
    setSocket(socket) { 
        this.socket = socket
    }

    // Отправка команды
    socketSend(cmd, value) { 
        this.socket.sendMsg(`(${cmd} ${value})`)
    }

    // Обработка сообщения
    processMsg(msg){ 
        // Разбор сообщения
        let data = Msg.parseMsg(msg) 
        if (!data) throw new Error("Parse error\n" + msg)

        // Первое (hear) - начало игры
        if (data.cmd == "hear") this.run = true
        if (data.cmd == "init") this.initAgent(data.p) // Инициализация 

        this.analyzeEnv(data.msg, data.cmd, data.p) // Обработка
    }

    initAgent(p){
        if(p[0] == "r") this.position = "r" // Правая половина поля 
        if(p[1]) this.id = p[1] // id игрока
    }

    // Анализ сообщения
    analyzeEnv(msg, cmd, p){ 
        if(cmd == "see"){
            console.log(p[1]["cmd"])
        }
    }

    sendCmd(){
        // Игра начата 
        if(this.run){ 
            // Есть команда от игрока
            if(this.act){ 
                switch(this.act.n) {
                    // Пнуть мяч
                    case "kick": this.socketSend(this.act.n, this.act.v + " 0"); break;
                    
                    // Движение и поворот
                    default: this.socketSend(this.act.n, this.act.v); break;
                }                    
            }

            // Сброс команды
            this.act = null 
        }
    }
}

// Экспорт класса агента
module.exports = Agent 