const Msg = require('./msg')
const readline = require('readline')

// Функции для работы с флагами и координатами
const flagsData = require("./data/flags.json")
const interpret = require("./utils").interpret
const getPosition3Flags = require("./utils").getPosition3Flags
const getPosition2Flags = require("./utils").getPosition2Flags

class Agent {
    constructor(debug=false, run=false, act=null) {
        this.position = "l"   // По умолчанию левая половина поля
        this.run      = run   // Игра начата
        this.act      = act   // Действия
        this.debug    = debug // Нужно ли выводить информацию об игроке и окружении
        
        this.x = undefined
        this.y = undefined
        
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
        // this.debug служит для вывода в консоль данных о координатах текущего агента
        if (cmd === "see") this.debug ? this.analyzeSeeCommand(cmd, p): null;
        if (cmd === "sense_body") this.debug ? this.analyzeSenseCommand(cmd, p): null;
    }

    // Анализ сообщения о том, что видит игрок
    analyzeSeeCommand(cmd, p) {
        // I. Считываем все наблюдаемые объекты и переводим их в тип Object
        let observables = []
        for (let observable of p) {
            if (typeof observable !== "object") continue;

            // Парсим данные, которы пришли из сокета
            const observable_label = observable.cmd.p.join("")
            const observable_data  = observable.p

            // Интерпретируем полученные данные
            observables.push(interpret([observable_label, ...observable_data]))
        }

        // Отфильтруем все флаги и инвертируем их значение y
        let flags = observables.filter(element => element.label[0] === "f" || element.label[0] === "g")

        // Для каждого увиденного флага определяем координаты
        flags.forEach(element => {
            let coords = Object.assign({}, flagsData[element.label]) // assign чтобы ликвидировать ссылочность
            coords.y = this.position === "l" ? -coords.y: coords.y;  // Если игрок левой стороны, инвертируем значение координаты У
            coords.x = this.position === "r" ? -coords.x: coords.x;  // Если игрок правой стороны, инвертируем значение координаты Х
            element.coords = coords
        });

        // II. Считаем координаты самого игрока по флагам
        // Отфильтруем флаги и отберем те, дистанцию до которых мы знаем. Отсортируем по направлению
        const flagsWithDistance = flags.filter(flag => typeof flag.distance != "undefined")
            .sort((a, b) => a.direction - b.direction); 

        let player_coords
        if (flagsWithDistance.length >= 3) { // Видим три или более флагов
            // Берем два самых крайних в поле зрения флага
            const flag_data_2 = flagsWithDistance[0]
            const flag_data_3 = flagsWithDistance[flagsWithDistance.length - 1]
            
            // Перебираем средний флаг
            // Нельзя, чтобы знаменатель в из алгоритма в utils.js был равен нулю
            // Отсортируем оставшеся флаги по близости
            let flag_data_1;
            for (let flag of flagsWithDistance.slice(1, -1).sort((a, b) => a.distance - b.distance)) {
                flag_data_1 = flag
                if ((flag_data_2.coords.x === flag.coords.x) || (flag.coords.x === flag_data_3.coords.x) || (flag_data_2.coords.y === flag.coords.y) || (flag.coords.y === flag_data_3.coords.y)) 
                    continue // Флаг нам не подходит, но чтобы не окончить цикл вообще без флага, сохраним его
                else 
                    break // Обнаружили подходящий флаг. Оканчиваем перебор
            }

            // Найдем координаты
            player_coords = getPosition3Flags(flag_data_1, flag_data_2, flag_data_3)
            this.x = player_coords.x
            this.y = player_coords.y
            console.log(`Координаты игрока: x=${player_coords.x}, y=${player_coords.y}. Определены по флагам (${flag_data_1.label}, ${flag_data_2.label}, ${flag_data_3.label})`) 
        } else if (flagsWithDistance.length === 2) { // Видим только два флага
            // Берем два единственных флага
            const flag_data_1 = flagsWithDistance[0]
            const flag_data_2 = flagsWithDistance[1]

            // Найдем координаты
            player_coords = getPosition2Flags(flag_data_1, flag_data_2)
            this.x = player_coords.x
            this.y = player_coords.y
            console.log(`Координаты игрока: x=${player_coords.x}, y=${player_coords.y}. Определены по флагам (${flag_data_1.label}, ${flag_data_2.label})`) 
        } else { // Видим только один флаг или вообще не видим флаги
            console.log(`Обновление координат провалено: недостаточно флагов. Крайние записанные координаты: x=${this.x}, y=${this.y}`)
        }

        // III. Считаем координаты других игроков (если знаем свои координаты)
        if (this.x && this.y) {
            for (let observable of observables) {
                if (observable.label[0] === "p") {
                    let observable_player = observable;

                    // Выбираем соперника, который достаточно близок, чтобы игроку суметь посчитать расстояние до него
                    if (observable_player.distance) {
                        // Определяем координаты соперника
                        const observable_player_distance  = observable_player.distance
                        const observable_player_direction = observable_player.direction - this.directionOfSpeed - this.headAngle
            
                        const observable_player_angle  = observable_player_direction * Math.PI / 180
                        const observable_player_coords = {
                            x: player_coords.x + Math.cos(observable_player_angle) * observable_player_distance,
                            y: player_coords.y + Math.sin(observable_player_angle) * observable_player_distance
                        } 
            
                        console.log(`Наблюдаю игрока ${observable_player.label} с координатами x=${observable_player_coords.x}, y=${observable_player_coords.y}. `)
                    }
                }
            }
        } else {
            console.log("Не можем определить координаты других игроков, т.к. не знаем своих координат.")
        }
    }

    // Анализ сенсоров игрока
    analyzeSenseCommand(cmd, p) {
        for (let obj of p) {
            if (obj.cmd == 'head_angle') 
                this.headAngle = obj.p[0]
            
            if (obj.cmd == 'speed') 
                this.directionOfSpeed = obj.p[1]
        }
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