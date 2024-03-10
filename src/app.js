const Agent = require('./agent'); 
const { AgentController } = require('./controller');
const createAgentSocket = require('./socket')
const VERSION_DEFAULT = 7
const prompt = require("prompt-sync")();

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
    sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) }

    // Добавить агента 
    addAgent(teamLabel, debug=false) {
        // Проверяем, определена ли команда
        if (!Object.hasOwn(this.teams, teamLabel)) throw Error(`Команды '${teamLabel}' не существует`)
        
        // Создаем агента
        const agent = new Agent(debug)

        // Создаем сокет
        createAgentSocket(agent, teamLabel, this.version)

        // Добавить агента в команду
        this.teams[teamLabel].push(agent)
        return agent
    }

    // Запуск ЛР №1
    async setupFirstLab() {
        const x = prompt("Введите координату Х игрока: ")
        const y = prompt("Введите координату У игрока: ")
        const angle = prompt("Введите значение поворота игрока в такт (1 секунда = 10 тактов): ")

        // Создаем игрока
        const left_agent = this.addAgent(this.leftTeamLabel, true); await this.sleep(1) 
        left_agent.socketSend("move", `${x} ${y}`);                 await this.sleep(1) 

        // Создаем соперника
        const right_agent = this.addAgent(this.rightTeamLabel); await this.sleep(1) 
        right_agent.socketSend("move", `-30 0`);                await this.sleep(1) 

        // Запускаем цикл для поворота игрока
        setInterval(() => { left_agent.socketSend("turn", String(angle)) }, 100);
    }

    // Запуск ЛР №2
    async setupSecondLab() {
        const x = prompt("Введите координату Х игрока: ")
        const y = prompt("Введите координату У игрока: ")

        // Создаем игрока
        const agent = this.addAgent(this.leftTeamLabel, true); await this.sleep(5) 
        agent.socketSend("move", `${x} ${y}`);                 await this.sleep(5) 

        // Последовательность действий
        const action_queue = [
            // {"act": "flag", "fl": "frb"},
            // {"act": "flag", "fl": "gl"},
            // {"act": "flag", "fl": "fc"},
            {"act": "kick", "fl": "b", "goal": "gr"},
        ]

        // Исполняем инструкции
        const controller = new AgentController()
        agent.setActions(action_queue)
        agent.setController(controller)
    }
}

module.exports = App;