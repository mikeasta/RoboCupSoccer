const Agent = require('./agent'); 
const createAgentSocket = require('./socket')
const VERSION_DEFAULT = 7
const ARRANGEMENT_DEFAULT = require("./data/players.json")

class App {
    constructor(version=VERSION_DEFAULT, leftTeamLabel="Pandas", rightTeamLabel="Polars") {
        this.version = version

        this.leftTeamLabel  = leftTeamLabel
        this.rightTeamLabel = rightTeamLabel

        this.teams = {}
        this.teams[leftTeamLabel]  = []
        this.teams[rightTeamLabel] = []
    }

    // Функция задержки исполнения синхронного кода
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Добавить агента
    addAgent(teamLabel) {
        // Проверяем, определена ли команда
        if (!Object.hasOwn(this.teams, teamLabel)) 
            throw Error(`Команды '${teamLabel}' не существует`)
        
        // Создаем агента
        const agent = new Agent()

        // Создаем сокет
        console.log("qwe")
        const agentSocket = createAgentSocket(agent, teamLabel, this.version)

        // Добавить агента в команду
        this.teams[teamLabel].push(agent)
        return agent
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

        // Заполняем ее агентами
        for (let i=0; i < 11; i++)
            this.addAgent(teamLabel)

        // Расставляем игроков
        this.arrangeTeamAgents(teamLabel, arrangement)
    }

    // Инициализировать стартовые условия
    setupGame() {
        // Создать команды
        this.setupTeam(this.leftTeamLabel)
        this.setupTeam(this.rightTeamLabel)
    }

    // Путешествовать по квадрату
    async setupFirstLab() {
        // Создаем игрока
        const left_agent = this.addAgent(this.leftTeamLabel); await this.sleep(1)

        // Расставим сокомандников
        const teammate_1 = this.addAgent(this.leftTeamLabel); await this.sleep(1)
        const teammate_2 = this.addAgent(this.leftTeamLabel); await this.sleep(1)
        
        teammate_1.socketSend("move", "-20 -5"); await this.sleep(1) // 2
        teammate_2.socketSend("move", "-20 5");  await this.sleep(1) // 3

        // Расставим соперников
        const opponent_1 = this.addAgent(this.rightTeamLabel); await this.sleep(1)
        const opponent_2 = this.addAgent(this.rightTeamLabel); await this.sleep(1)
        const opponent_3 = this.addAgent(this.rightTeamLabel); await this.sleep(1)
        const opponent_4 = this.addAgent(this.rightTeamLabel); await this.sleep(1)
        
        opponent_1.socketSend("move", "-15 0");  await this.sleep(1)
        opponent_2.socketSend("move", "-10 -5"); await this.sleep(1)
        opponent_3.socketSend("move", "-10 5");  await this.sleep(1)
        opponent_4.socketSend("move", "-20 0");  await this.sleep(1)

        while (true) {
            await this.sleep(1000)
            left_agent.socketSend("move", "-15 0")
            await this.sleep(3000)
            left_agent.socketSend("move", "-15 -15")
            await this.sleep(3000)
            left_agent.socketSend("move", "0 -15")
            await this.sleep(3000)
            left_agent.socketSend("move", "-30 0")
            await this.sleep(2000)
        }
    }

    // Запустить игру
    startGame() {
        console.log("Game Started")
    }
}

module.exports = App;