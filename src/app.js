const Agent = require('./agent'); 
const createAgentSocket = require('./socket')
const VERSION_DEFAULT = 7
const ARRANGEMENT_DEFAULT = require("./data/players.json")

class App {
    constructor(version=VERSION_DEFAULT) {
        this.version = version
        this.teams   = {} 
    }

    // Добавить агента
    addAgent(teamLabel) {
        // Проверяем, определена ли команда
        if (!Object.hasOwn(this.teams, teamLabel)) 
            throw Error(`Команды '${teamLabel}' не существует`)
        
        // Создаем агента
        const agent = new Agent()

        // Создаем сокет
        const agentSocket = createAgentSocket(agent, teamLabel, this.version)

        // Добавить агента в команду
        this.teams[teamLabel].push(agent)
    }

    // Расставить игроков
    arrangeTeamAgents(teamLabel, arrangement) {
        // Проверяем совпадение размера команды и разметки игроков
        if (this.teams[teamLabel].length != arrangement.length) 
            throw Error(`Неправильные данные при попытке расставить игроков: размер команды = ${this.teams[teamLabel].length}, размер расстановки = ${arrangement.length}`)

        for (let i = 0; i < arrangement.length; i++) {
            // Определяем входные данные
            const cmd   = "move"
            const value = arrangement[i]["x"] + " " + arrangement[i]["y"]

            // Отправляем команду по сокету агента
            this.teams[teamLabel][i].socketSend(cmd, value)
        }
    }

    // Создать команду
    setupTeam(teamLabel, arrangement = ARRANGEMENT_DEFAULT) {
        // Проверяем, сколько команд уже определено
        if (Object.keys(this.teams).length === 2)
            throw Error(`Уже инициализированны две команды: ${Object.keys(this.teams)}`)

        // Создаем команду и заполняем ее агентами
        this.teams[teamLabel] = []
        for (let i=0; i < 11; i++)
            this.addAgent(teamLabel)

        // Расставляем игроков
        this.arrangeTeamAgents(teamLabel, arrangement)
    }

    // Инициализировать стартовые условия
    setupGame(leftTeamLabel="Bears", rightTeamLabel="Bulls") {
        // Создать команды
        this.setupTeam(leftTeamLabel)
        this.setupTeam(rightTeamLabel)
    }

    // Запустить игру
    startGame() {
        console.log("Game Started")
    }

    closeGame() {
        console.log(false)
    }
}

module.exports = App;

// let time = 3000

// function sleep(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
// }
// async function demo() {
//     while(true) {
//         agent.socketSend("move", `-15 0`) 
//         agent.msg
//         await sleep(time)
//         agent.socketSend("move", `0 15`)
//         await sleep(time)
//         agent.socketSend("move", `15 0`)
//         await sleep(time)
//         agent.socketSend("move", `0 -15`)
//         await sleep(time)
//     }
// }
// demo()