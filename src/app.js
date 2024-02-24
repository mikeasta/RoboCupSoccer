const Agent = require('./agent'); 
const createAgentSocket = require('./socket')
const VERSION_DEFAULT = 7

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
    addAgent(teamLabel, debug=false) {
        // Проверяем, определена ли команда
        if (!Object.hasOwn(this.teams, teamLabel)) 
            throw Error(`Команды '${teamLabel}' не существует`)
        
        // Создаем агента
        const agent = new Agent(debug)

        // Создаем сокет
        createAgentSocket(agent, teamLabel, this.version)

        // Добавить агента в команду
        this.teams[teamLabel].push(agent)
        return agent
    }

    // Путешествовать по квадрату
    async setupFirstLab() {
        // Создаем игрока
        const left_agent = this.addAgent(this.leftTeamLabel, true); await this.sleep(1) // слипы для того, чтобы
        left_agent.socketSend("move", "-15 0");                     await this.sleep(1) // агент успевал отправить запрос (инфа не точная)

        // Запускаем параллельный цикл для поворота игрока влево
        setInterval(() => { left_agent.socketSend("turn", "-15") }, 1500);

        // Перемещение игрока
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
}

module.exports = App;