const Msg = require('./msg')
const readline = require('readline')

// Функции для работы с флагами и координатами
const flagsData = require("./data/flags.json")
const interpretFlag = require("./utils").interpretFlag
const getPosition3Flags = require("./utils").getPosition3Flags
const distance = require("./utils").distance
const validateCoords = require("./utils").validateCoords

class Agent {
    constructor(debug=false, run=false, act=null) {
        this.position = "l"   // По умолчанию левая половина поля
        this.run      = run   // Игра начата
        this.act      = act   // Действия
        this.debug    = debug // Нужно ли выводить информацию об игроке и окружении

        // Чтение консоли
        this.rl = readline.createInterface({ 
            input: process.stdin,
            output: process.stdout
        })

        // Обработка строки из консоли
        this.rl.on('line', input => {  
            // Если игра начата движения вперед, вправо, влево, удар по мячу
            if(this.run) { 
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
        switch(cmd) {
            case "see": this.debug ? this.analyzeSeeCommand(cmd, p): null; break;
        }
    }

    // Анализ сообщения о том, что видит игрок
    analyzeSeeCommand(cmd, p) {
        // 1. Сериализуем полученную инфу
        let observables = []
        let flags       = []
        for (let observable of p) {
            // Если итеруируемый элемент не объект - пропускаем итерацию
            // т.к. наблюдаемые объекты представлены как Object
            if (typeof observable !== "object") continue;

            // Получаем название наблюдаемого объекта
            const label = observable.cmd.p.join("")
            const observable_data = observable.p

            if (label[0] === "f" || label[0] === "g") {
                // Рассматриваемый объект - флаг
                // Достанем его из базы
                const flag_coords = Object.assign({}, flagsData[label])
                
                // Инвертируем кординату Y, если игрок на левой стороне
                flag_coords.y = this.position === "l" ? -flag_coords.y: flag_coords.y;

                // ! Сразу интерпретируем флаги
                flags.push(interpretFlag([label, flag_coords, ...observable_data]))
            } else {
                // Другие объекты пока не обрабатываем
                observables.push([label, ...observable_data])
            }
        }

        // // Вывод всех флагов
        // console.log("Что я вижу:")
        // console.log(flags) // Вывод всех наблюдаемых флагов
        
        // 2. Считаем координаты самого игрока по флагам

        const flagsWithDistance = flags
            .filter(flag => typeof flag.distance != "undefined")
            .sort((a, b) => a.distance - b.distance)
            .sort((a, b) => a.direction - b.direction); 

        if (flagsWithDistance.length >= 3) {
            // Берем два самых крайних в поле зрения флага
            const flag_data_1 = flagsWithDistance[0]
            const flag_data_3 = flagsWithDistance[flagsWithDistance.length - 1]

            // Перебираем средний флаг
            let flag_data_2;

            // 1. Нельзя, чтобы было 3 одинаковых х и у
            // 2. Нельзя, чтобы было 2 одинаковых точки
            for (let flag of flagsWithDistance.slice(1, -1)) {
                flag_data_2 = flag
                if (((flag_data_1.x === flag.x) && (flag.x === flag_data_3.x)) || ((flag_data_1.y === flag.y) && (flag.y === flag_data_3.y))) 
                    continue
                else 
                    break
            }

            // Если у всех флагов одинаковая какая либо координата, то возьмем точку из середины
            if (((flag_data_1.x === flag_data_2.x) && (flag_data_2.x === flag_data_3.x)) || ((flag_data_1.y === flag_data_2.y) && (flag_data_2.y === flag_data_3.y))) 
                flag_data_2 = flagsWithDistance[flagsWithDistance.length - Math.round(flagsWithDistance.length/2)]
            
            // Найдем координаты
            const player_coords = getPosition3Flags(flag_data_1, flag_data_2, flag_data_3)
            console.log(player_coords, [this.position, flag_data_1.label, flag_data_1.coords, flag_data_2.label, flag_data_2.coords, flag_data_3.label, flag_data_3.coords,]) 
        } 

        // 3. Считаем координаты сокомандников

        // 4. Считаем координаты врагов

        // 5. Считаем координаты мяча

    }

    sendCmd() {
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